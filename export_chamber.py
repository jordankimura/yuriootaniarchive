import bpy
from pathlib import Path
import sys

root = Path(__file__).resolve().parent
scene = bpy.data.scenes['Yuri Ootani - Summoning Study']
bpy.context.window.scene = scene
scene.frame_set(1)
bpy.ops.object.select_all(action='DESELECT')
for obj in scene.objects:
    # The website supplies the actual dossier content and lighting.
    keep = obj.type == 'MESH' and not obj.parent
    keep = keep or obj.name == 'ANIMATE - Project dossier' or obj.name == 'Dossier paper'
    if keep:
        obj.select_set(True)
        if obj.name == 'Chamber floor':
            obj.scale.x = .1
            obj.scale.y = .1
out = root / 'public/models/chamber.glb'
out.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(out), use_selection=True, export_format='GLB',
    export_animations=True, export_animation_mode='SCENE', export_force_sampling=True)
print('Exported', out)
