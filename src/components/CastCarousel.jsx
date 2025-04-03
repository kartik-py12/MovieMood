import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// Add custom styles for Swiper that Tailwind can't handle
const swiperStyles = `
  .cast-swiper .swiper-button-next,
  .cast-swiper .swiper-button-prev {
    color: white;
    background-color: rgba(0, 0, 0, 0.5);
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cast-swiper .swiper-button-next:after,
  .cast-swiper .swiper-button-prev:after {
    font-size: 18px;
  }
  .cast-swiper .swiper-button-disabled {
    opacity: 0.3;
  }
`;

const CastCarousel = ({ cast }) => {
  // No image placeholder
  const noImagePlaceholder = 'https://via.placeholder.com/185x278?text=No+Image';
  
  return (
    <div className="w-full my-5">
      <style>{swiperStyles}</style>
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={15}
        slidesPerView="auto"
        className="cast-swiper py-2.5 -my-2.5"
      >
        {cast.map((person) => (
          <SwiperSlide key={person.id} className="w-auto h-auto">
            <Link to={`/person/${person.id}`} className="no-underline text-inherit">
              <div className="w-36 h-full bg-gray-900 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-1 md:w-32">
                <div className="w-36 h-[210px] overflow-hidden md:w-32 md:h-[180px]">
                  <img
                    src={
                      person.profile_path
                        ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                        : noImagePlaceholder
                    }
                    alt={person.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-2.5 text-center">
                  <h3 className="m-0 mb-1 text-sm font-semibold text-white line-clamp-2 md:text-xs">{person.name}</h3>
                  {person.character && (
                    <p className="m-0 text-xs text-gray-400 italic line-clamp-2 md:text-[0.7rem]">{person.character}</p>
                  )}
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CastCarousel;
