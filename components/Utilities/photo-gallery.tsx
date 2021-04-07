import React, { useState } from "react"
import Lightbox from "react-image-lightbox"
import { Carousel, Icon } from "antd"
import { CarouselArrow } from "./carousel-arrow"
import { useOptimisedImage, useOriginalImage } from "./CommonFunction"

export interface PhotoGalleryContext {
  photos: any,
  windowWidth?: any
}

export const PhotoGallery = ({
  photos,
  windowWidth
}: PhotoGalleryContext) => {

  if (photos.length < 1) {
    return null
  }

  // const photosPerSlide = windowWidth < 576 ? 1 : windowWidth < 768 ? 3 : 5
  // const slidesToShow = photos.length > photosPerSlide ? photosPerSlide : photos.length

  const [ image, setImage ] = useState(null)
  const prevImage = (image) => {
    let index = photos.indexOf(image)
    if (index === 0) return photos[photos.length - 1]
    return photos[index - 1]
  }
  const nextImage = (image) => {
    let index = photos.indexOf(image)
    if (index === photos.length - 1) return photos[0]
    return photos[index + 1]
  }

  return (
    <div className="photo-gallery">
      <Carousel
        arrows={true}
        prevArrow={<CarouselArrow iconElement={<span className="carousel-arrow"><Icon type="arrow-left" /></span>} />}
        nextArrow={<CarouselArrow iconElement={<span className="carousel-arrow"><Icon type="arrow-right" /></span>} />}
        dots={false}
        infinite={true}
        draggable={true}
        centerMode={windowWidth < 614 ? false : true}
        variableWidth={windowWidth < 576 ? false : true}
      >
        {photos.map(photo => 
          <div key={photo.id}>
            <a onClick={() => setImage(photo)}>
              <img src={useOptimisedImage(photo.url)} />
            </a>
          </div>
        )}
      </Carousel>

      {image &&
        <Lightbox
          mainSrc={useOriginalImage(image.url)}
          prevSrc={useOriginalImage(prevImage(image).url)}
          nextSrc={useOriginalImage(nextImage(image).url)}
          onCloseRequest={() => setImage(null)}
          onMovePrevRequest={() => setImage(prevImage(image))}
          onMoveNextRequest={() => setImage(nextImage(image))}
          imageTitle={image.title || ""}
          imageCaption={image.desc || ""}
        />
      }
    </div>
  )
}