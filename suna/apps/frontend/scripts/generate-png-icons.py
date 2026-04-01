#!/usr/bin/env python3
"""
Generate PNG icon assets for CarbonScope branding
Uses PIL/Pillow to create raster images
"""

import os
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    print("PIL/Pillow not available. Install with: pip install Pillow")
    PIL_AVAILABLE = False

# Brand colors
EMERALD = (52, 211, 153)  # #34D399
DARK_BG = (11, 17, 32)     # #0B1120
GRAY = (156, 163, 175)     # #9CA3AF

# Get public directory
SCRIPT_DIR = Path(__file__).parent
PUBLIC_DIR = SCRIPT_DIR.parent / 'public'

def create_favicon():
    """Create favicon.png (32x32)"""
    if not PIL_AVAILABLE:
        return

    size = 32
    img = Image.new('RGB', (size, size), DARK_BG)
    draw = ImageDraw.Draw(img)

    # Draw simple emerald "B"
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', 24)
    except:
        font = ImageFont.load_default()

    draw.text((size//2, size//2), 'B', fill=EMERALD, font=font, anchor='mm')

    img.save(PUBLIC_DIR / 'favicon.png')
    print(f'Created favicon.png ({size}x{size})')

def create_icon_192():
    """Create icon.png (192x192) for PWA"""
    if not PIL_AVAILABLE:
        return

    size = 192
    img = Image.new('RGB', (size, size), DARK_BG)
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', 140)
    except:
        font = ImageFont.load_default()

    draw.text((size//2, size//2), 'B', fill=EMERALD, font=font, anchor='mm')

    img.save(PUBLIC_DIR / 'icon.png')
    print(f'Created icon.png ({size}x{size})')

def create_apple_icon():
    """Create apple-icon.png (180x180)"""
    if not PIL_AVAILABLE:
        return

    size = 180
    img = Image.new('RGB', (size, size), DARK_BG)
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', 130)
    except:
        font = ImageFont.load_default()

    draw.text((size//2, size//2), 'B', fill=EMERALD, font=font, anchor='mm')

    img.save(PUBLIC_DIR / 'apple-icon.png')
    print(f'Created apple-icon.png ({size}x{size})')

def create_og_image():
    """Create og-image.png (1200x630) for social sharing"""
    if not PIL_AVAILABLE:
        return

    width, height = 1200, 630
    img = Image.new('RGB', (width, height), DARK_BG)
    draw = ImageDraw.Draw(img)

    # Title
    try:
        title_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', 80)
    except:
        title_font = ImageFont.load_default()

    draw.text((width//2, height//2 - 40), 'BKS cBIM AI', fill=EMERALD, font=title_font, anchor='mm')

    # Subtitle
    try:
        subtitle_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf', 36)
    except:
        subtitle_font = ImageFont.load_default()

    draw.text((width//2, height//2 + 40), 'Carbon Assessment Platform', fill=GRAY, font=subtitle_font, anchor='mm')

    img.save(PUBLIC_DIR / 'og-image.png')
    print(f'Created og-image.png ({width}x{height})')

def create_favicon_ico():
    """Create favicon.ico from PNG"""
    if not PIL_AVAILABLE:
        return

    favicon_png = PUBLIC_DIR / 'favicon.png'
    if not favicon_png.exists():
        create_favicon()

    img = Image.open(favicon_png)
    img.save(PUBLIC_DIR / 'favicon.ico', format='ICO', sizes=[(32, 32), (16, 16)])
    print('Created favicon.ico')

if __name__ == '__main__':
    print('Generating CarbonScope branded PNG assets...\n')

    if not PIL_AVAILABLE:
        print('ERROR: PIL/Pillow not available')
        print('Install with: pip install Pillow')
        exit(1)

    create_favicon()
    create_icon_192()
    create_apple_icon()
    create_og_image()
    create_favicon_ico()

    print('\nDone! PNG assets created in public/')
