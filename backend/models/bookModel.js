import mongoose from "mongoose";
import uniqueValidator  from "mongoose-unique-validator";

const bookSchema = mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true , unique : true},
    author: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    ratings: [
      {
        userId: { type: String, required: true },
        userRated: { type: Number, required: true }, 
      },
    ],
    imageUrl: { type: String, required: true },
    averageRating: { type: Number, required: true }, 
  }, 
);

bookSchema.plugin(uniqueValidator);
export default mongoose.model('Book', bookSchema)