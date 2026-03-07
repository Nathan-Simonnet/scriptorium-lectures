import mongoose from "mongoose";

const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { 
    type: String, 
    required: true,
    maxlength: 50 
  },
  author: { 
    type: String, 
    required: true,
    maxlength: 40
  },
  year: { 
    type: Number, 
    required: true,
    validate: {
      validator: function(v) {
        return !isNaN(v) && String(v).length <= 4;
      },
      message: props => `${props.value} is not a valid year!`
    }
  },
  genre: { 
    type: String, 
    required: true,
    maxlength: 40
  },
  ratings: {
    type: [{
      userId: { type: String, required: true },
      userRated: { 
        type: Number, 
        required: true,
        min: 0,
        max: 5
      }
    }],
    validate: {
      validator: function(v) {
        return v.length === 1;
      },
      message: props => 'Ratings must contain exactly one rating!'
    }
  },
  imageUrl: { type: String, required: true },
  averageRating: { type: Number, required: true }
});

export default mongoose.model('Book', bookSchema);