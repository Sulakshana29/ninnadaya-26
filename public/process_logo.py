import sys
from PIL import Image

def process_logo(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        r, g, b, a = item
        # The background is dark brown/black. 
        # Let's say if the pixel is relatively dark and not very yellow, make it transparent
        # We can just look at luminance or a threshold.
        # Alternatively, if r < 60 and g < 60 and b < 60, it's dark background.
        if r < 40 and g < 30 and b < 20:
            # Make it fully transparent
            new_data.append((r, g, b, 0))
        elif r < 80 and g < 60 and b < 40:
            # Semi-transparent feathering
            alpha = int(((r + g + b) / 180) * 255)
            new_data.append((r, g, b, alpha))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    
    # We also want to crop it to the center where the logo is
    # The logo text "Ninnadaya '26" is in the middle. Let's just save it with transparency first.
    img.save(output_path, "PNG")
    print(f"Saved processed logo to {output_path}")

if __name__ == "__main__":
    process_logo(sys.argv[1], sys.argv[2])
