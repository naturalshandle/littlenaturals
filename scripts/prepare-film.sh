#!/usr/bin/env bash
# ==========================================================================
# prepare-film.sh — turns the source film into the scroll-film assets.
# Dev-time only. Needs ffmpeg (with libwebp) and awk. Run from anywhere:
#
#   bash scripts/prepare-film.sh
#   FFMPEG=/path/to/ffmpeg bash scripts/prepare-film.sh   # custom ffmpeg
#
# Reads   assets/film/source/little-naturals-journey.mp4   (git-ignored)
#         scripts/film-config.txt   (watermark box, blur patches, mobile crop)
#         js/film-data.js           (chapter start/end → poster times)
# Writes  assets/film/desktop/f000.webp … (1600×900, every frame)
#         assets/film/mobile/f000.webp …  (900×1125 portrait 4:5, every frame)
#         assets/film/posters/*.webp      (first frame + middle of each chapter)
#         assets/film/source/build/       (clean master + before/after proofs; git-ignored)
#
# Clean-up applied to every frame before anything is exported:
#   1. audio dropped
#   2. generator watermark removed (delogo)
#   3. baked-in wall text softened with feathered blur patches that follow
#      the text as the camera moves (drawbox mask driven per frame by sendcmd,
#      Gaussian-feathered, blurred copy merged through it)
# ==========================================================================
set -euo pipefail

cd "$(dirname "$0")/.."
FFMPEG="${FFMPEG:-ffmpeg}"
SRC="assets/film/source/little-naturals-journey.mp4"
CFG="scripts/film-config.txt"
DATA="js/film-data.js"
OUT="assets/film"
BUILD="$OUT/source/build"
DESKTOP_W=1600; DESKTOP_Q="${DESKTOP_QUALITY:-70}"
MOBILE_W=900;   MOBILE_H=1125; MOBILE_Q="${MOBILE_QUALITY:-68}"
POSTER_Q=80
BLUR="boxblur=luma_radius=24:luma_power=2:chroma_radius=12:chroma_power=2"

command -v "$FFMPEG" >/dev/null 2>&1 || { echo "ffmpeg not found. Install it (Windows: winget install Gyan.FFmpeg) or set FFMPEG=/path/to/ffmpeg" >&2; exit 1; }
[ -f "$SRC" ] || { echo "Missing $SRC — put the source video there first." >&2; exit 1; }

# ---- Probe: size, fps, frame count ---------------------------------------
INFO="$("$FFMPEG" -hide_banner -i "$SRC" 2>&1 || true)"
SIZE="$(printf '%s' "$INFO" | grep -m1 -oE 'Video: .*' | grep -oE '[0-9]{3,5}x[0-9]{3,5}' | head -1)"
SRC_W="${SIZE%x*}"; SRC_H="${SIZE#*x}"
FPS="$(printf '%s' "$INFO" | grep -m1 -oE '[0-9.]+ fps' | grep -oE '[0-9.]+')"
DUR="$(printf '%s' "$INFO" | grep -m1 -oE 'Duration: [0-9:.]+' | awk -F'[: ]+' '{print $2*3600+$3*60+$4}')"
FRAMES="$(awk -v d="$DUR" -v f="$FPS" 'BEGIN{printf "%d", d*f+0.5}')"
echo "Source: ${SRC_W}x${SRC_H}, ${FPS} fps, ${DUR}s, ${FRAMES} frames"

rm -rf "$BUILD/proof"; mkdir -p "$BUILD" "$BUILD/proof"
rm -rf "$OUT/desktop" "$OUT/mobile" "$OUT/posters"
mkdir -p "$OUT/desktop" "$OUT/mobile" "$OUT/posters"

# ---- 1. Per-frame blur-mask commands (sendcmd) ---------------------------
# Every patch is three nested drawboxes: core (text + <pad>, full strength),
# then two fainter rings out to <feather> px, so wide patches fade gradually.
# For every frame each drawbox is moved onto its interpolated box, or parked
# off-screen while its range is inactive.
CMDS="$BUILD/blur-cmds.txt"
awk -v frames="$FRAMES" -v fps="$FPS" '
  $1=="blur" { n++; name[n]=$2; pad[n]=$3; fe[n]=$4; k[n]=0
    for (i=5;i<=NF;i++) { split($i,a,":"); k[n]++; T[n,k[n]]=a[1]; X0[n,k[n]]=a[2]; Y0[n,k[n]]=a[3]; X1[n,k[n]]=a[4]; Y1[n,k[n]]=a[5] } }
  # Only emit a box when it changed since the previous frame (keeps the file small).
  function box(id, g,   v) {
    v=sprintf("%d %d %d %d", on?int(x0-g):-9999, on?int(y0-g):0, on?int(x1-x0+2*g):4, on?int(y1-y0+2*g):4)
    if (last[id]==v) return ""
    last[id]=v; split(v,q," ")
    return sprintf(", drawbox@%s x %d, drawbox@%s y %d, drawbox@%s w %d, drawbox@%s h %d", id, q[1], id, q[2], id, q[3], id, q[4]) }
  END {
    for (r=1;r<=n;r++) { last[name[r] "-o"]=last[name[r] "-m"]=last[name[r]]="-9999 0 4 4" }
    for (f=0; f<frames; f++) {
      t=f/fps; ts=(f==0)?0:t-0.5/fps
      line=sprintf("%.4f ", ts)
      for (r=1;r<=n;r++) {
        on=(t>=T[r,1]-1e-6 && t<=T[r,k[r]]+1e-6)
        if (on) {
          j=1; while (j<k[r]-1 && t>T[r,j+1]) j++
          span=T[r,j+1]-T[r,j]; u=(span>0)?(t-T[r,j])/span:0; if(u<0)u=0; if(u>1)u=1
          x0=X0[r,j]+(X0[r,j+1]-X0[r,j])*u; y0=Y0[r,j]+(Y0[r,j+1]-Y0[r,j])*u
          x1=X1[r,j]+(X1[r,j+1]-X1[r,j])*u; y1=Y1[r,j]+(Y1[r,j+1]-Y1[r,j])*u
        }
        line=line box(name[r] "-o", pad[r]+fe[r]) box(name[r] "-m", pad[r]+fe[r]/2) box(name[r], pad[r])
      }
      if (line ~ /, /) { sub(/ , /, " ", line); print line ";" }
    }
  }' "$CFG" > "$CMDS"

BOXES="$(awk '$1=="blur"{ d="x=-9999:y=0:w=4:h=4:t=fill"; printf ",drawbox@%s-o=%s:c=white@0.15,drawbox@%s-m=%s:c=white@0.3,drawbox@%s=%s:c=white", $2, d, $2, d, $2, d }' "$CFG")"
FEATHER="$(awk '$1=="feather"{print $2}' "$CFG")"; FEATHER="${FEATHER:-9}"
read -r LX LY LW LH <<<"$(awk '$1=="logo"{print $2, $3, $4, $5}' "$CFG")"

# ---- 2. Clean master (no audio, no watermark, softened text) -------------
# Mask: black canvas + moving white boxes → Gaussian feather → levels lift so
# the core is fully blurred while the edge fades out with no visible box.
echo "Cleaning (watermark + text softening)…"
"$FFMPEG" -nostdin -hide_banner -loglevel error -y -i "$SRC" \
  -f lavfi -i "color=c=black:s=${SRC_W}x${SRC_H}:r=${FPS}:d=${DUR}" \
  -filter_complex "\
[0:v]delogo=x=${LX}:y=${LY}:w=${LW}:h=${LH},format=yuv420p,split=2[base][b];\
[b]${BLUR}[blurred];\
[1:v]format=yuv420p,sendcmd=f=${CMDS}${BOXES},gblur=sigma=${FEATHER},lutyuv=y='clip((val-16)*1.6,0,255)':u=128:v=128,format=gray[mask];\
[blurred][mask]alphamerge[soft];\
[base][soft]overlay=shortest=1:format=auto,format=yuv420p[v]" \
  -map "[v]" -an -c:v libx264 -preset medium -crf 12 -g "$FPS" -pix_fmt yuv420p "$BUILD/clean.mp4"

# ---- 3. Mobile crop path (4:5, follows the 'focus' keyframes) ------------
CROP_W="$(awk -v h="$SRC_H" 'BEGIN{printf "%d", h*4/5/2*2}')"
CROP_X="$(awk -v cw="$CROP_W" -v sw="$SRC_W" '
  $1=="focus" { for (i=2;i<=NF;i++) { split($i,a,":"); n++; T[n]=a[1]; C[n]=a[2] } }
  END {
    e=C[n]
    for (i=n-1;i>=1;i--) e=sprintf("if(lt(t,%s),%s+(%s)*(t-%s)/%s,%s)", T[i+1], C[i], C[i+1]-C[i], T[i], T[i+1]-T[i], e)
    printf "clip((%s)-%d,0,%d)", e, cw/2, sw-cw
  }' "$CFG")"

# ---- 4. Frame sequences ---------------------------------------------------
echo "Exporting desktop + mobile frames…"
"$FFMPEG" -nostdin -hide_banner -loglevel error -y -i "$BUILD/clean.mp4" \
  -filter_complex "[0:v]split=2[d][m];\
[d]scale=${DESKTOP_W}:-2:flags=lanczos[dv];\
[m]crop=${CROP_W}:${SRC_H}:'${CROP_X}':0,scale=${MOBILE_W}:${MOBILE_H}:flags=lanczos[mv]" \
  -map "[dv]" -c:v libwebp -quality "$DESKTOP_Q" -compression_level 6 -preset photo -start_number 0 "$OUT/desktop/f%03d.webp" \
  -map "[mv]" -c:v libwebp -quality "$MOBILE_Q"  -compression_level 6 -preset photo -start_number 0 "$OUT/mobile/f%03d.webp"

# ---- 5. Posters: first frame + middle of each chapter ---------------------
# Chapter times come from js/film-data.js ("start: X, end: Y").
poster() { # $1 time  $2 name
  local fr; fr="$(awk -v t="$1" -v f="$FPS" -v n="$FRAMES" 'BEGIN{x=int(t*f+0.5); if(x>n-1)x=n-1; print x}')"
  "$FFMPEG" -nostdin -hide_banner -loglevel error -y -i "$BUILD/clean.mp4" -filter_complex \
    "[0:v]select='eq(n,${fr})',split=2[a][b];[a]scale=${DESKTOP_W}:-2:flags=lanczos[d];[b]crop=${CROP_W}:${SRC_H}:'${CROP_X}':0,scale=${MOBILE_W}:${MOBILE_H}:flags=lanczos[m]" \
    -map "[d]" -frames:v 1 -c:v libwebp -quality "$POSTER_Q" "$OUT/posters/$2-desktop.webp" \
    -map "[m]" -frames:v 1 -c:v libwebp -quality "$POSTER_Q" "$OUT/posters/$2-mobile.webp"
}
echo "Exporting posters…"
poster 0 first
i=0
while read -r s e; do
  i=$((i+1))
  poster "$(awk -v s="$s" -v e="$e" 'BEGIN{print (s+e)/2}')" "chapter-$i"
done < <(grep -oE 'start: *[0-9.]+, *end: *[0-9.]+' "$DATA" | awk -F'[:,]' '{gsub(/ /,""); print $2, $4}')

# ---- 6. Before/after proofs (for review, git-ignored) --------------------
echo "Writing before/after proofs to $BUILD/proof/…"
# Each proof: rows = frames, left = source, right = cleaned. Frame-exact (select).
proof() { # $1 name  $2 crop "w:h:x:y"  $3.. frame numbers
  local name="$1" crop="$2"; shift 2
  local n=$# graph="" i=0 f
  for f in "$@"; do
    graph+="[0:v]select='eq(n,$f)',crop=$crop,scale=-2:300,setpts=PTS-STARTPTS[a$i];"
    graph+="[1:v]select='eq(n,$f)',crop=$crop,scale=-2:300,setpts=PTS-STARTPTS[b$i];"
    graph+="[a$i][b$i]hstack[r$i];"; i=$((i+1))
  done
  if [ "$n" -gt 1 ]; then for ((i=0;i<n;i++)); do graph+="[r$i]"; done; graph+="vstack=inputs=$n[out]"
  else graph+="[r0]null[out]"; fi
  "$FFMPEG" -nostdin -hide_banner -loglevel error -y -i "$SRC" -i "$BUILD/clean.mp4" \
    -filter_complex "$graph" -map "[out]" -strict unofficial -frames:v 1 "$BUILD/proof/$name.jpg"
}
proof watermark "220:220:$((LX-66)):$((LY-66))" 24 84 150
# Per blur patch: crop around everything it ever covers, at 15% / 50% / 85% of its range.
awk -v fps="$FPS" -v sw="$SRC_W" -v sh="$SRC_H" '$1=="blur" {
    x0=1e9; y0=1e9; x1=-1; y1=-1
    for (i=5;i<=NF;i++) { split($i,a,":"); if(a[2]<x0)x0=a[2]; if(a[3]<y0)y0=a[3]; if(a[4]>x1)x1=a[4]; if(a[5]>y1)y1=a[5] }
    split($5,s,":"); split($NF,e,":"); m=90
    x0=(x0-m<0)?0:x0-m; y0=(y0-m<0)?0:y0-m; x1=(x1+m>sw)?sw:x1+m; y1=(y1+m>sh)?sh:y1+m
    w=int((x1-x0)/2)*2; h=int((y1-y0)/2)*2; d=e[1]-s[1]
    printf "%s %d:%d:%d:%d %d %d %d\n", $2, w, h, x0, y0, (s[1]+d*0.15)*fps, (s[1]+d*0.5)*fps, (s[1]+d*0.85)*fps
  }' "$CFG" | while read -r name crop f1 f2 f3; do
  proof "blur-$name" "$crop" "$f1" "$f2" "$f3"
done

# ---- Sizes ---------------------------------------------------------------
kb() { du -ck "$@" | tail -1 | cut -f1; }
echo
echo "Desktop frames: $(ls "$OUT/desktop" | wc -l) files, $(kb "$OUT"/desktop/*.webp) KB"
echo "Mobile frames:  $(ls "$OUT/mobile"  | wc -l) files, $(kb "$OUT"/mobile/*.webp) KB"
echo "Posters:        $(ls "$OUT/posters" | wc -l) files, $(kb "$OUT"/posters/*.webp) KB"
echo "Done."
