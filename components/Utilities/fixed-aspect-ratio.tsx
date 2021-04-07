import React, { CSSProperties, ReactChild } from "react"

export interface FixedAscpectRatioContext {
  ratio?: string,
  children?: ReactChild,
  imageUrl?: string,
  className?: string,
  style?: CSSProperties
}

export const FixedAspectRatio = ({
  ratio = "1:1",
  children,
  imageUrl,
  className,
  style = {}
}: FixedAscpectRatioContext) => {

  const [ width, height ] = ratio.split(':')
  const percentage = (parseInt(height) / parseInt(width)) * 100

  if (imageUrl) style.backgroundImage = `url(${imageUrl})`

  return (
    <div className="fixed-aspect-ratio" style={{ paddingTop: `${percentage}%` }}>
      <div className={`fixed-aspect-ratio-background ${className}`} style={style}>
        {children}
      </div>
    </div>
  )
}