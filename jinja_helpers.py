# -*- coding: utf-8 -*-

import os
import logging
import subprocess

from wt.jinja import functions


logger = logging.getLogger('wt.app')


@functions.add
def image_dimensions(*parts):
    filename = os.path.join(*parts)
    stat, info = subprocess.getstatusoutput('identify "%s"' % filename)
    if stat == 0:
        info = info.split()
        if len(info) > 3:
            dim = info[2]
            w, h = map(int, dim.split('x', 1))
            return w, h
    return 0, 0
