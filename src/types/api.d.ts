export declare namespace Api {
  interface Spot {
    id: string;
    name: string;
    difficulty: Difficulty;
    disciplines: Disciplines;
    location: Location;
    pictures: Array<Picture>;
    videos: Array<Video>;
    tags: Array<Tag>;
  }

  interface Location {
    latitude: number;
    longitude: number;
    country: string;
    postalCode: number;
    city: string;
    address: string;
  }

  interface Media {
    spotId: string;
    sourceUrl: string;
    description: string;
  }

  interface Video extends Media {}

  interface Picture extends Media {}

  interface Tag {
    id: string;
    name: string;
  }

  type Difficulty = 'low' | 'mid' | 'hard' | 'pro' | 'hammer';

  type Disciplines = Array<'BMX' | 'skate' | 'roller'>;
}