import * as React from 'react'
import { HTMLMotionProps } from 'framer-motion'

import { MotionBox, IMotionBoxProps } from './box'

export const PageTransition: React.FC<IMotionBoxProps> = (props) => (
  <MotionBox
    initial={{ y: -24, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    {...props}
  />
)
