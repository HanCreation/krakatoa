"""Extract a small, reproducible Sunda Strait coastline asset from Natural Earth 1:10m."""
import json
from pathlib import Path

source = Path('public/data/countries-source.geojson')
from urllib.request import urlopen
data = json.loads(source.read_text(encoding='utf-8')) if source.exists() else json.load(urlopen('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson'))
country = next(f for f in data['features'] if f['properties']['ADMIN'] == 'Indonesia')

def clip(points, axis, value, greater):
    result = []
    for a,b in zip(points, points[1:]+points[:1]):
        ia = a[axis]>=value if greater else a[axis]<=value
        ib = b[axis]>=value if greater else b[axis]<=value
        if ia: result.append(a)
        if ia != ib:
            t=(value-a[axis])/(b[axis]-a[axis])
            result.append([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])])
    return result

result=[]
for name,index in [('Sumatra',58),('Java',23)]:
    points=country['geometry']['coordinates'][index][0][:-1]
    for axis,val,greater in [(0,103,True),(0,108,False),(1,-8,True),(1,-3.5,False)]:
        points=clip(points,axis,val,greater)
    result.append({'name':name,'coordinates':[[round(x,6),round(y,6)] for x,y in points]})
Path('public/data/sunda-coastlines.json').write_text(json.dumps({'source':'Natural Earth 1:10m, public domain','url':'https://www.naturalearthdata.com/','polygons':result},separators=(',',':')),encoding='utf-8')
print([(p['name'],len(p['coordinates'])) for p in result])
