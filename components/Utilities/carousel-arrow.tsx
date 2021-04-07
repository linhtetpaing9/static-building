import React, { CSSProperties } from "react"

export interface CarouselArrowContext {
  iconElement: any
  className?: string
  style?: CSSProperties
  onClick?: any
}

export const CarouselArrow = ({
  iconElement = "",
  className = "",
  style = {},
  onClick = {}
}: CarouselArrowContext) => {
  return (
    <div
      className={className}
      style={style}
      onClick={onClick}
    >
      {iconElement}
    </div>
  )
}