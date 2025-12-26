import re
import base64

svg_path = 'public/eih.svg'
png_path = 'public/eih.png'

with open(svg_path, 'r') as f:
    content = f.read()

# Find base64 data
match = re.search(r'xlink:href="data:image/png;base64,([^"]+)"', content)
if match:
    b64_data = match.group(1)
    # Fix newlines if any
    b64_data = b64_data.replace('\n', '')
    
    with open(png_path, 'wb') as f:
        f.write(base64.b64decode(b64_data))
    print(f"Successfully extracted {png_path}")
else:
    print("No base64 image found in SVG")
