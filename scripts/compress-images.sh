#!/bin/bash

# Image compression script
# Compresses all JPG images in public/blog to max width 800px with quality 75

MAX_WIDTH=800
QUALITY=75

echo "Starting image compression..."
echo "Parameters: Max width=${MAX_WIDTH}px, Quality=${QUALITY}"
echo ""

# Find all JPG files (case insensitive)
find public/blog -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) | while read -r file; do
    echo "Processing: $file"

    # Get original size
    original_size=$(stat -f%z "$file")

    # Get current dimensions
    dimensions=$(sips -g pixelWidth -g pixelHeight "$file" | grep -E "pixelWidth|pixelHeight" | awk '{print $2}')
    width=$(echo "$dimensions" | sed -n '1p')
    height=$(echo "$dimensions" | sed -n '2p')

    echo "  Original: ${width}x${height} ($(numfmt --to=iec-i --suffix=B $original_size 2>/dev/null || echo "${original_size} bytes"))"

    # Only resize if width is greater than MAX_WIDTH
    if [ "$width" -gt "$MAX_WIDTH" ]; then
        # Resize maintaining aspect ratio
        sips --resampleWidth "$MAX_WIDTH" --setProperty formatOptions "$QUALITY" "$file" > /dev/null 2>&1

        # Get new size
        new_size=$(stat -f%z "$file")
        new_dimensions=$(sips -g pixelWidth -g pixelHeight "$file" | grep -E "pixelWidth|pixelHeight" | awk '{print $2}')
        new_width=$(echo "$new_dimensions" | sed -n '1p')
        new_height=$(echo "$new_dimensions" | sed -n '2p')

        echo "  Resized:  ${new_width}x${new_height} ($(numfmt --to=iec-i --suffix=B $new_size 2>/dev/null || echo "${new_size} bytes"))"

        # Calculate savings
        saved=$((original_size - new_size))
        percent=$((100 - (new_size * 100 / original_size)))
        echo "  Saved: $(numfmt --to=iec-i --suffix=B $saved 2>/dev/null || echo "${saved} bytes") (${percent}% reduction)"
    else
        # Just compress without resizing
        sips --setProperty formatOptions "$QUALITY" "$file" > /dev/null 2>&1

        new_size=$(stat -f%z "$file")
        saved=$((original_size - new_size))
        percent=$((100 - (new_size * 100 / original_size)))
        echo "  Compressed only: $(numfmt --to=iec-i --suffix=B $new_size 2>/dev/null || echo "${new_size} bytes") (${percent}% reduction)"
    fi

    echo ""
done

echo "Compression complete!"
