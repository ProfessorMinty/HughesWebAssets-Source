"""Reproduce delivery images from the explicitly reviewed published illustrations."""
from pathlib import Path
import hashlib, io, json, urllib.request, urllib.error, time
from PIL import Image
import cairosvg

root = Path(__file__).resolve().parents[1]
app = root / 'apps/mushroom-exploration'
originals = app / 'source-assets/published-diagrams'
originals.mkdir(parents=True, exist_ok=True)
catalog = json.loads((app / 'source/published-diagrams.json').read_text())
receipt = []
for item in catalog:
    request = urllib.request.Request(item['originalUrl'], headers={'User-Agent': 'HughesRoomViews/1.0 (educational image acquisition)'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                raw = response.read(12_000_001)
                if len(raw) > 12_000_000:
                    raise ValueError('Illustration exceeds the reviewed size bound')
            break
        except urllib.error.HTTPError as error:
            if error.code not in (429, 500, 502, 503, 504) or attempt == 3:
                raise
            time.sleep(min(60, 15 * (attempt + 1)))
    original = originals / (item['id'] + item['originalExtension'])
    original.write_bytes(raw)
    rendered = cairosvg.svg2png(bytestring=raw, output_width=1600) if item['originalExtension'] == '.svg' else raw
    image = Image.open(io.BytesIO(rendered)).convert('RGBA')
    image.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
    destination = app / 'src/assets' / ('diagram-' + item['id'] + '.webp')
    image.save(destination, 'WEBP', lossless=True, method=6)
    data = destination.read_bytes()
    receipt.append({**item, 'file': './assets/' + destination.name, 'width': image.width, 'height': image.height,
                    'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
                    'originalBytes': len(raw), 'originalSha256': hashlib.sha256(raw).hexdigest(),
                    'changes': 'Converted to lossless WebP and resized to at most 1800 pixels. No redrawing, relabelling, cropping or recolouring.'})
    print(item['id'], image.size, len(data))
    time.sleep(3)
(app / 'source/published-diagrams.delivery.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
registry = [{**item, 'id': 'mushroom-diagram:' + item['id'], 'type': 'Published diagram', 'subject': item['caption'], 'fit': 'contain'} for item in receipt]
(app / 'src/diagram-catalog.js').write_text('// Published illustrations: creator, source, licence and byte provenance.\nexport const MUSHROOM_DIAGRAMS = ' + json.dumps(registry, ensure_ascii=False, indent=2) + ';\n')
