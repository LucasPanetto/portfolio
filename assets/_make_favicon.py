from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

SIZE = 1024
PRIMARY = (108, 92, 231)   # #6c5ce7
PRIMARY2 = (0, 212, 255)   # #00d4ff
BG = (11, 14, 20)          # #0b0e14

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def make_gradient(size, c1, c2, angle_deg=135):
    # diagonal gradient via per-pixel projection
    w, h = size, size
    grad = Image.new("RGB", (w, h))
    px = grad.load()
    rad = math.radians(angle_deg)
    dx, dy = math.cos(rad), math.sin(rad)
    # project every corner to find min/max for normalization
    corners = [(0, 0), (w, 0), (0, h), (w, h)]
    projs = [x * dx + y * dy for x, y in corners]
    pmin, pmax = min(projs), max(projs)
    for y in range(h):
        for x in range(w):
            p = (x * dx + y * dy - pmin) / (pmax - pmin)
            px[x, y] = lerp(c1, c2, p)
    return grad

print("Building gradient...")
grad = make_gradient(SIZE, PRIMARY, PRIMARY2, angle_deg=45)

# rounded-rect mask
radius = int(SIZE * 0.225)
mask = Image.new("L", (SIZE, SIZE), 0)
mdraw = ImageDraw.Draw(mask)
mdraw.rounded_rectangle([0, 0, SIZE - 1, SIZE - 1], radius=radius, fill=255)

icon = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
icon.paste(grad, (0, 0), mask)

# subtle top-left radial highlight for depth
highlight = Image.new("L", (SIZE, SIZE), 0)
hdraw = ImageDraw.Draw(highlight)
hdraw.ellipse([-SIZE*0.35, -SIZE*0.35, SIZE*0.75, SIZE*0.75], fill=70)
highlight = highlight.filter(ImageFilter.GaussianBlur(SIZE * 0.12))
white_layer = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
white_layer.putalpha(highlight)
icon = Image.alpha_composite(icon, Image.composite(
    Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 255)), white_layer, highlight
).convert("RGBA").point(lambda p: p) if False else icon)
# simpler: composite highlight directly
hl_rgba = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
hl_rgba.putalpha(highlight)
icon = Image.alpha_composite(icon, hl_rgba)
icon.putalpha(Image.composite(mask, Image.new("L", (SIZE, SIZE), 0), mask))

# subtle inner shadow at bottom-right for depth
shadow = Image.new("L", (SIZE, SIZE), 0)
sdraw = ImageDraw.Draw(shadow)
sdraw.ellipse([SIZE*0.35, SIZE*0.35, SIZE*1.35, SIZE*1.35], fill=60)
shadow = shadow.filter(ImageFilter.GaussianBlur(SIZE * 0.12))
sh_rgba = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
sh_rgba.putalpha(shadow)
icon = Image.alpha_composite(icon, sh_rgba)
icon.putalpha(mask)

# monogram "LP"
draw = ImageDraw.Draw(icon)
font_path = "C:/Windows/Fonts/arialbd.ttf"
font = ImageFont.truetype(font_path, int(SIZE * 0.44))

text = "LP"
bbox = draw.textbbox((0, 0), text, font=font)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
tx = (SIZE - tw) / 2 - bbox[0]
ty = (SIZE - th) / 2 - bbox[1]

# soft dark shadow behind text for legibility
shadow_layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
sdraw2 = ImageDraw.Draw(shadow_layer)
sdraw2.text((tx, ty + SIZE * 0.012), text, font=font, fill=(0, 0, 0, 90))
shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(SIZE * 0.01))
icon = Image.alpha_composite(icon, shadow_layer)
draw = ImageDraw.Draw(icon)
draw.text((tx, ty), text, font=font, fill=(255, 255, 255, 255))

# small cyan accent dot (echoes the navbar-brand "Lucas.Panetto" dot)
dot_r = SIZE * 0.035
dot_cx = SIZE / 2 + tw * 0.50
dot_cy = SIZE / 2 + th * 0.30
draw.ellipse([dot_cx - dot_r, dot_cy - dot_r, dot_cx + dot_r, dot_cy + dot_r], fill=(255, 255, 255, 235))

icon.save("icon-source-1024.png")
print("Saved icon-source-1024.png", icon.size)

sizes = {
    "favicon-16.png": 16,
    "favicon-32.png": 32,
    "favicon-48.png": 48,
    "favicon-192.png": 192,
    "favicon-512.png": 512,
    "apple-touch-icon.png": 180,
}
for name, s in sizes.items():
    im = icon.resize((s, s), Image.LANCZOS)
    im.save(name)
    print(name, im.size)

# multi-size favicon.ico
ico_sizes = [16, 32, 48]
icon.save("../favicon.ico", sizes=[(s, s) for s in ico_sizes])
print("Saved ../favicon.ico")
