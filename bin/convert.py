#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import glob
import pathlib
import subprocess
import time


cwd = pathlib.Path(os.path.realpath(os.curdir))
src = cwd.joinpath('_wip', 'img')
dst_large = cwd.joinpath('static', 'img', 'large')
dst_medium = cwd.joinpath('static', 'img', 'medium')
dst_small = cwd.joinpath('static', 'img', 'small')


def sources(path):
    path = path.joinpath('**', '*.JPG')
    return glob.iglob(str(path), recursive=True)


def dimension(filename):
    stat, info = subprocess.getstatusoutput('identify "%s"' % filename)
    if stat == 0:
        info = info.split()
        if len(info) > 3:
            dim = info[2]
            w, h = map(int, dim.split('x', 1))
            return w, h
    return 0, 0


def resize(filename, geometry, extent, target):
    target = target.joinpath(filename.relative_to(src))
    cmd = ('mogrify '
           '-path %s '
           '-filter Triangle '
           '-define filter:support=2 '
           '-thumbnail %s '
           # '-gravity center '
           # '%s'  # extent
           # '-background LightYellow2 '
           '-unsharp 0.25x0.08+8.3+0.045 '
           '-dither None '
           # '-posterize 136 '
           '-quality 100 '
           '-define jpeg:fancy-upsampling=off '
           # '-define png:compression-filter=5 '
           # '-define png:compression-level=9 '
           # '-define png:compression-strategy=1 '
           # '-define png:exclude-chunk=all '
           '-interlace none '
           '-colorspace sRGB '
           '%s'
           ) % (target.parent,
                geometry,
                # extent,
                filename)
    target.parent.mkdir(parents=True, exist_ok=True)
    stat, info = subprocess.getstatusoutput(cmd)
    result = str(target).lower()
    target.replace(result)
    return stat, info, pathlib.Path(result)


def overlay(filename):
    ov = src.joinpath('overlay.png')
    cmd = ('composite '
           '%s '  # overlay
           '%s '  # source
           '-gravity SouthEast '
           '-format jpg '
           '-quality 100 '
           '%s '  # dest
           ) % (ov, filename, filename)
    stat, info = subprocess.getstatusoutput(cmd)
    if stat != 0:
        print('[!] %s' % info)


def optimize(filename):
    return subprocess.getstatusoutput('jpegoptim -m80 "%s"' % filename)


def main():
    for p in sources(src):
        p = pathlib.Path(p)
        w, h = dimension(p)
        for geom, extent, path in (('1280', '', dst_large),
                                   ('500', '-extent 500x500 ', dst_medium),
                                   ('200', '-extent 200x200 ', dst_small)):
            if w < h:
                geom = 'x' + geom
            stat, info, result = resize(p, geom, extent, path)
            if stat == 0:
                if path is dst_large:
                    overlay(result)
                stat, info = optimize(result)
            print(info)
            time.sleep(0.5)


if __name__ == '__main__':
    main()
