import React, { useState } from "react"
import Lightbox from "react-image-lightbox"
import { Timeline } from "antd"
import { useOptimisedImage, useOriginalImage } from "../Utilities/CommonFunction"

export const TourItinerary = ({
  itinerary = null,
  photos = []
}) => {

  if (!itinerary) {
    return null
  }

  const itineraryArray = itinerary
    .split('<h2')
    .filter(item => item)
    .map(item => {
      const photoSearchStrings = item.match(/\[(.*?)\]/g) || []
      const itemPhotos = photos.filter(photo => 
        photoSearchStrings.find(searchString => 
          photo.title.indexOf(searchString.replace('[', '').replace(']', '').trim()) > -1
        )
      )
      const [ title, body ] = item.replace(photoSearchStrings, '').trim().split('</h2>')
      return {
        photos: itemPhotos,
        title: "<h2" + title + "</h2>",
        body: body
      }
    })
  
  if (itineraryArray.length < 1) {
    return (
      <div className="tour-itinerary innerHTML" dangerouslySetInnerHTML={{__html: itinerary }} />
    )
  }

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
    <>
      <Timeline className="itinerary">
        {itineraryArray.map((item, itemIndex) =>
          <Timeline.Item 
            key={itemIndex}
            dot={<img src="/img/h2-icon.png" />}
          >
            <div className="tour-itinerary">
              <div dangerouslySetInnerHTML={{__html: item.title }} />
              {item.photos.map((photo, photoIndex) =>
                <a 
                  className="tour-itinerary-photo"
                  onClick={() => setImage(photo)}
                >
                  <img key={photoIndex} src={useOptimisedImage(photo.url)} height={100} />
                </a>
              )}
              <div dangerouslySetInnerHTML={{__html: item.body }} />
            </div>
          </Timeline.Item>
        )}
      </Timeline>
      {image &&
        <Lightbox
          mainSrc={useOriginalImage(image.url)}
          prevSrc={useOriginalImage(prevImage(image).url)}
          nextSrc={useOriginalImage(nextImage(image).url)}
          onCloseRequest={() => setImage(null)}
          onMovePrevRequest={() => setImage(prevImage(image))}
          onMoveNextRequest={() => setImage(nextImage(image))}
          imageTitle={image.title?.replace(/\[(.*?)\]/g, '').trim() || ""}
          imageCaption={image.desc || ""}
        />
      }
    </>
  )
}