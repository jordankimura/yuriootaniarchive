"""Run in Blender's Scripting workspace. Creates a NEW scene; preserves existing scenes."""
import bpy
import math
from mathutils import Vector
from pathlib import Path

scene = bpy.data.scenes.new('Yuri Ootani - Summoning Study')
bpy.context.window.scene = scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 24
scene.render.resolution_x = 1200
scene.render.resolution_y = 1000
scene.render.resolution_percentage = 100
scene.render.fps = 30
scene.frame_start = 1
scene.frame_end = 150
world = bpy.data.worlds.new('Archive Night')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.018, .026, .05, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = .3
scene.world = world

def material(name, color, metallic=0, roughness=.4, emission=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metallic
    p.inputs['Roughness'].default_value = roughness
    if emission:
        p.inputs['Emission Color'].default_value = (*color, 1)
        p.inputs['Emission Strength'].default_value = emission
    return m

dark = material('Midnight ceramic', (.025,.042,.065), .55)
edge = material('Brushed champagne', (.48,.30,.12), .75)
cyan = material('Cyan luminous inlay', (.08,.65,.8), .3, emission=4)
paper = material('Warm archival paper', (.82,.79,.66), roughness=.65)
ink = material('Printed midnight ink', (.025,.07,.095), roughness=.7)

def finish(obj, name, mat, bevel=0):
    obj.name = name
    obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new('Soft machined edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        obj.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
    return obj

def box(name, location, scale, mat, bevel=.04):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    ob = bpy.context.object
    ob.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(ob, name, mat, bevel)

def ring(name, radius, thickness, location, mat, upright=False):
    bpy.ops.mesh.primitive_torus_add(major_radius=radius, minor_radius=thickness,
        major_segments=96, minor_segments=12, location=location)
    ob = finish(bpy.context.object, name, mat)
    if upright:
        ob.rotation_euler.x = math.pi/2
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob

box('Chamber floor', (0,0,-.2), (200,200,.2), dark)
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=3.1, depth=.32, location=(0,0,0))
finish(bpy.context.object, 'Summoning dais', dark, .08)
ring('Dais outer rim', 3.02,.025,(0,0,.19),edge)
ring('Dais inner light', 2.55,.018,(0,0,.18),cyan)

for r in (2.15,2.4):
    ring('Portal concentric frame',r,.065,(0,1.05,2.7),edge,True)
ring('Portal light rim',2.28,.025,(0,1.03,2.7),cyan,True)

for i in range(12):
    a = i*math.tau/12
    x,z = math.sin(a)*2.04, 2.7+math.cos(a)*2.04
    ob = box('Aperture segment %02d'%i,(x,1.05,z),(.38,.22,.66),dark)
    ob.rotation_euler.y = a
    ob.keyframe_insert(data_path='location',frame=1)
    ob.keyframe_insert(data_path='location',frame=30)
    ob.location.x *= 1.17
    ob.location.z = 2.7+(z-2.7)*1.17
    ob.keyframe_insert(data_path='location',frame=66)
    ob.keyframe_insert(data_path='location',frame=150)
    mark = box('Radial light %02d'%i,(math.sin(a)*2.65,1.06,2.7+math.cos(a)*2.65),(.025,.045,.20),cyan,.008)
    mark.rotation_euler.y = a

bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0,-.25,2.55))
dossier = bpy.context.object
dossier.name = 'ANIMATE - Project dossier'

def attach(ob):
    ob.parent = dossier
    return ob

attach(box('Dossier paper',(0,0,0),(2.05,.055,2.8),paper,.045))
attach(box('Dossier header rule',(0,-.038,.92),(1.72,.008,.012),ink,.002))
attach(box('Project image placeholder',(0,-.04,.18),(1.72,.012,.97),dark,.015))
attach(box('Category accent',(-.82,-.06,.18),(.018,.014,.84),cyan,.003))

def label(body, x, z, size, mat=ink):
    bpy.ops.object.text_add(location=(x,-.075,z),rotation=(math.pi/2,0,0))
    ob = bpy.context.object
    ob.name = 'Typography - '+body
    ob.data.body = body
    ob.data.size = size
    ob.data.extrude = 0
    ob.data.materials.append(mat)
    attach(ob)
    return ob

label('YURI OOTANI / ARCHIVE',-.85,1.13,.105)
label('FILE 004',-.85,.76,.095)
label('PROJECT STUDY',-.70,.12,.145,paper)
label('Maui Manifesto',-.85,-.54,.18)
label('WRITING  /  2026',-.85,-.76,.085)
label('A bureaucratic fairy tale.',-.85,-.99,.09)
label('VIEW PROJECT  >',-.85,-1.20,.085)

for frame, location, angle, scale in [
    (1,(0,.8,2.3),math.pi/2,.01),
    (30,(0,.8,2.3),math.pi/2,.01),
    (55,(0,.25,2.55),math.pi/2,.75),
    (78,(0,-.25,2.55),-.10,1.06),
    (94,(0,-.25,2.55),0,1),
    (150,(0,-.25,2.55),0,1)]:
    dossier.location = location
    dossier.rotation_euler.z = angle
    dossier.scale = (scale,)*3
    for prop in ('location','rotation_euler','scale'):
        dossier.keyframe_insert(data_path=prop,frame=frame)

def area(name,location,power,color,size,target=(0,0,2)):
    data=bpy.data.lights.new(name,'AREA')
    data.energy=power
    data.color=color
    data.shape='DISK'
    data.size=size
    ob=bpy.data.objects.new(name,data)
    scene.collection.objects.link(ob)
    ob.location=location
    ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler()
    return ob

area('Soft dossier key',(1,-5,7),1100,(.8,.9,1),5)
area('Amber rim',(-4,1,5),1300,(1,.58,.22),3)
area('Cyan rim',(4,2,3),1700,(.16,.65,1),3)
burst=area('Summon pulse',(0,.7,2.6),0,(.18,.75,1),2,(0,-2,2))
for frame,power in [(1,0),(30,0),(58,160),(67,1500),(76,100),(94,0),(150,0)]:
    burst.data.energy=power
    burst.data.keyframe_insert(data_path='energy',frame=frame)

bpy.ops.object.camera_add(location=(6,-14,7))
camera=bpy.context.object
camera.name='Camera - Archive portrait stage'
camera.rotation_euler=(Vector((0,0,2.25))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO'
camera.data.ortho_scale=8.4
scene.camera=camera
for name,frame in [('IDLE',1),('SUMMON',30),('OPEN',55),('IMPACT',67),('REVEAL',94)]:
    scene.timeline_markers.new(name,frame=frame)
scene.frame_set(110)
for screen in bpy.data.screens:
    for area_ui in screen.areas:
        if area_ui.type=='VIEW_3D':
            area_ui.spaces.active.region_3d.view_perspective='CAMERA'

# Set YURI_OUTPUT_DIR externally for automated rendering; normal UI runs only create the scene.
import os
output=os.environ.get('YURI_OUTPUT_DIR')
if output:
    out=Path(output)
    out.mkdir(parents=True,exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(out/'yuri_chamber.blend'))
    scene.render.filepath=str(out/'yuri_chamber_preview.png')
    bpy.ops.render.render(write_still=True)
print('Yuri chamber ready. Frame 1: idle. Frames 30-94: summon. Frame 110: revealed dossier.')
