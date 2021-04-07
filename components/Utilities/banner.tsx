export interface BannerContext {
  backgroundImageUrl: string
  title?: string
  subtitle?: string
  className?: string
}

export const Banner = ({
  backgroundImageUrl,
  title,
  subtitle,
  className
}: BannerContext) => {
  return (
    <div
      className={`banner ${className || ""}`}
      style={{ backgroundImage: `url(${backgroundImageUrl.replace('.jp', '_o.jp')})` }}
    >
      <div className="wrap">
        <h1>{title}</h1>
        <h5>{subtitle}</h5>
      </div>
    </div>
  )
}