import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: "dm49gry9m",
      api_key: "697324199995249",
      api_secret: "i8ym0KlLNWf4HZWsMA497BSD5wk",
    });
  },
};
