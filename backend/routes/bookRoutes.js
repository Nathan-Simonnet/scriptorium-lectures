import express, { response } from "express";
const router = express.Router();

// Cloudinary 
// ========================================
import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import fs from "fs/promises";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ dest: "uploads/" });
// Est ce obligé?

// Upload book
// Ajouter un middleware pour gérer l'envoi à cloudinary, le formatage du nom ect, puis envoyer a uploadBook avec l'adresse de l'image
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      public_id: req.file.originalname.split(".")[0] + "_" + Date.now(),
    });
    await fs.unlink(req.file.path); // Supprime le fichier temporaire si tout va bien...
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Problem on post /api/books/upload");
    res.status(500).json(error);
  }
});

const deleteImageFromCloud = async (url) => {
  if (!url) {
    return console.log('No URL return to delete image from Cloud')
  };

  try {
    const fileName = url.split('/').pop().split(".")[0];
    const result = await cloudinary.uploader.destroy(fileName, { resource_type: 'image' });
    if (result.result === 'ok') {
      console.log("Image" + fileName + " deleted successfully from Cloud");
    } else {
      console.log("Image" + fileName + " not found or already deleted from Cloudi");
    }
  } catch (error) {
    console.error("Connection problem when trying to delete image from Cloud");
  }
};

// Books
// ========================================
import Book from "../models/bookModel.js";
import auth from "../middlewares/auth.js";

router.get("/", (req, res) => {

  const { title, author, genre, numberofBooksToDisplay } = req.query;
  // If search by filter 
  const filter = {};
  // if (author) filter.author = author;
  if (title) {
    // Recherche partielle ET insensible à la casse
    filter.title = { $regex: title, $options: 'i' }
    // SQL equivalent
    // WHERE author LIKE '%authorValue%' -- case-insensitive version
  };
  if (author) {
    // Recherche partielle ET insensible à la casse
    filter.author = { $regex: author, $options: 'i' }
  };
  if (genre) {
    // Recherche partielle ET insensible à la casse
    filter.genre = { $regex: genre, $options: 'i' }
  };

  Book.find(filter)
    // .limit(numberofBooksToDisplay === "all" ? null : parseInt(numberofBooksToDisplay) || 2)
    .limit(numberofBooksToDisplay === "all" ? null : parseInt(numberofBooksToDisplay) || null)
    .then(
      (books) => {
        console.log("Books found successfully");
        res.status(200).json(books);
      }
    ).catch(
      (error) => {
        console.log("Books not found, bookRoutes.js")
        res.status(404).json({ message: "Books not found", debug: "router.get('/', bookRoutes.js", error: error });
      }
    );
});

router.get("/best-rated", (req, res) => {
  try {
    Book.find()
      .sort({ averageRating: 'desc' })
      .limit(3)
      .then(bestBooks => {
        console.log("best-rated found successfully")
        res.status(200).json(bestBooks);
      })
      .catch(() => {
        console.log("best-rated books not found , bookRoutes.js")
        res.status(404).json({ message: "best-rated books not found", debug: "bookRoutes.js" })
      });
  } catch (err) {
    console.log("Error on GET api/books/best-rated , bookRoutes.js")
    res.status(500).json({ message: "Error on GET /best-rated", debug: "bookRoutes.js" })
  }
});

router.post("/", auth, (req, res) => {

  try {
    // const bookObject = JSON.parse(req.body);
    const bookObject = req.body;
    const currentYear = new Date().getFullYear();
    // Precise format only
    if (bookObject.title.length > 52
      || bookObject.author.length > 40
      || isNaN(bookObject.year)
      || bookObject.year > currentYear
      || bookObject.genre.length > 40
      || bookObject.ratings.length != 1
      || isNaN(bookObject.ratings[0].userRated)
      || bookObject.ratings[0].userRated < 0
      || bookObject.ratings[0].userRated > 5
      || !bookObject.imageUrl) {
      return res.status(400).json({ message: "Problem with the book format" });
    };

    // Cherry pick
    const book = new Book({
      // userId: req.auth.userId,
      userId: bookObject.userId,
      title: bookObject.title,
      author: bookObject.author,
      year: bookObject.year,
      genre: bookObject.genre,
      // // ratings: [{ userId: req.auth.userId, grade: bookObject.ratings[0].grade }],
      ratings: [{ userId: bookObject.userId, userRated: bookObject.ratings[0].userRated }],
      imageUrl: bookObject.imageUrl,
      averageRating: Number(bookObject.ratings[0]?.userRated || 0)
    });
    // Book saving 
    book.save()
      .then(() => {
        console.log("Book saved successfully")
        res.status(201).json({ message: 'Book saved !' });
      })
      .catch(error => {
        if (error.name === "ValidationError") {
          // Cela vient du plugin uniqueValidator
          res.status(400).json({ message: "The book is already used"});
        } else {
          console.log("The book could not be saved")
          res.status(500).json({ message: "Error saving the book", debug: "bookRoutes.js" });
        }
      });
  } catch (err) {
    console.log("Connection problem on POST /api/books")
    res.status(501).json({ message: "Error on POST api/books/", debug: "bookRoutes.js" })
  }
});

router.get("/:id", (req, res) => {
  try {
    Book.findOne({ _id: req.params.id })
      .then(
        (book) => {
          console.log("Book id " + req.params.id + " found");
          res.status(200).json(book);
        }
      ).catch(
        (error) => {
          console.log(error);
          res.status(404).json({ message: "Can not find the book id : " + req.params.id, debug: "bookRoutes.js" });
        }
      );
  } catch (error) {
    console.log("Eror in GET book id: " + req.params.id);
    return res.status(500).json({ message: "Eror in GET book id: " + req.params.id, debug: "bookRoutes.js" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    console.log("req.auth.userId", req.auth.userId)
    console.log("book.userId", book.userId)

    if (req.auth.userId !== book.userId) {
      console.log("Unauthorized action")
      return res.status(401).json({ message: "Unauthorized action" });
    }

    if (!book) {
      console.log("Book not found, bookRoutes.js, router.delete(/:id")
      return res.status(404).json({ message: "Book id: " + req.params.id + "not found" });
    }

    // Delete the image from cloud
    await deleteImageFromCloud(book.imageUrl);

    // Delete the book from database
    await Book.deleteOne({ _id: req.params.id });

    console.log("Book deleted successfully");
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error("Error in DELETE /api/book/:id, bookRoutes.js, router.delete(/:id");
    res.status(500).json({ message: "Error on DELETE book id: " + req.params.id, debug: "bookRoutes.js, router.delete(/:id" });
  }
});

function calculateAverageRating(ratings) {
  if (!ratings || ratings.length === 0) return 0; // Handle empty case
  const ratingsOnly = [];
  for (let i = 0; i < ratings.length; i++) {
    ratingsOnly.push(ratings[i].userRated);
  };
  const average = ratingsOnly.reduce((sum, value) => sum + value, 0) / ratingsOnly.length;

  return Math.floor(average);
  // return parseFloat((average / ratings.length).toFixed(2)); // Round to 2 decimal places
};

router.put("/:id", auth, (req, res) => {

  try {
    // const bookObject = JSON.parse(req.body);
    const bookObject = req.body;

    // Precise format only
    // ----------
    const currentYear = new Date().getFullYear();
    // const containsOnlyNumbers = /^\d+$/;
    if (bookObject.title.length > 52
      || bookObject.author.length > 40
      || isNaN(bookObject.year)
      || bookObject.year > currentYear
      || bookObject.year.length > 4
      || bookObject.genre.length > 40
      || isNaN(bookObject.newRating)
      || bookObject.newRating > 5
      || bookObject.newRating < 0
      || !bookObject.imageUrl) {
      console.log("Problem with the book format")
      return res.status(401).json({ message: "Problem with the book format" });
    };

    // Book find 
    // -------
    Book.findOne({ _id: req.params.id })
      .then(
        (book) => {
          // if (book.userId != req.auth.userId) {
          if (book.userId != bookObject.userId) {
            console.log("Action non auhtorisé")
            res.status(401).json({ message: 'Action non auhtorisé' });
          } else {
            // let newRatingsArray = [...book.ratings]; //// Not enough ! 
            let newRatingsArray = book.ratings.map(rating => ({
              userId: rating.userId,
              userRated: rating.userRated
            }));
            // Update only the rating corresponding to the userId
            newRatingsArray.find(r => r.userId === bookObject.userId).userRated = bookObject.newRating

            const updatedBook = {
              // userId: req.auth.userId,
              _id: req.params.id,
              userId: bookObject.userId,
              title: bookObject.title,
              author: bookObject.author,
              year: Number(bookObject.year),
              genre: bookObject.genre,
              ratings: newRatingsArray,
              imageUrl: bookObject.imageUrl,
              averageRating: Number(calculateAverageRating(newRatingsArray))
            };
            const deletePreviousImage = updatedBook.imageUrl != book.imageUrl;
            Book.updateOne(
              { _id: req.params.id },
              updatedBook,
            )
              .then(() => {
                if (deletePreviousImage) {
                  console.log("Deleting previous image...")
                  deleteImageFromCloud(book.imageUrl);
                };
                res.status(200).json({ message: 'Book updated successfully' });
              })
          }
        }
      ).catch(
        (error) => {
          console.log(error);
          res.status(404).json("Can not find the book _id : " + req.params.id);
        }
      );

  } catch (err) {
    console.log("Connection problem on post /api/books")
    res.status(500).json({ message: "The upload could not be processed" })
  }
});

router.put("/:id/ratings", auth, (req, res) => {
  try {
    // const bookObject = JSON.parse(req.body);
    const newRatingObject = req.body;
    console.log(newRatingObject)

    if (newRatingObject.length > 2
      || newRatingObject.userRated > 5
      || newRatingObject.userRated < 0) {
      console.log("The rating must be between 0 and 5")
      return res.status(401).json({ message: "Problem with the rating count" });
    };

    Book.findOne({ _id: req.params.id })
      .then((book) => {
        const hasUserRated = book.ratings.some(element => element.userId === newRatingObject.userId)
        if (hasUserRated) {
          console.log("The user has already rated this book, bookRouter.js, router.put('/:id/ratings'")
          return res.status(401).json({ message: "The user has already rated this book, bookRouter.js, router.put('/:id/ratings'" });
        } else {
          let newRatingsArray = [...book.ratings];
          newRatingsArray.push(newRatingObject)
          console.log("newRatingsArray:::", newRatingsArray)

          const updatedBook = {
            // userId: req.auth.userId,
            userId: book.userId,
            title: book.title,
            author: book.author,
            year: Number(book.year),
            genre: book.genre,
            ratings: newRatingsArray,
            imageUrl: book.imageUrl,
            averageRating: Number(calculateAverageRating(newRatingsArray))
          };
          Book.updateOne(
            { _id: req.params.id },
            updatedBook,
          ).then(() => {
            console.log('Rating updated successfully')
            res.status(200).json({ message: 'Rating updated successfully' });
          })
            .catch((error) => {
              console.log("Error updating the book, bookRouter.js, router.put('/:id/ratings'")
              res.status(500).json({ message: "Error updating the book", debug: "bookRouter.js, router.put('/:id/ratings'" })
            }
            );
        }
      }).catch(() => {
        console.log("Error finding the book _id : " + req.params.id, "bookRouter.js, router.put('/:id/ratings'");
        res.status(404).json({ message: "Error finding the book _id : " + req.params.id, debug: ", bookRouter.js, router.put('/:id/ratings'" });
      }
      );

  } catch (err) {
    console.log("Error in router.put('/:id/ratings'")
    res.status(500).json({ message: "Error in router.put('/:id/ratings'" })
  }
});

export default router;