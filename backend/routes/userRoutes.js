import express, { response } from "express";
const router = express.Router();

import Book from "../models/bookModel.js";
import auth from "../middlewares/auth.js";

router.get("/:id", auth, (req, res) => {
    res.status(200).json({ message: "Hello user "  + req.auth.userId});
});

router.get("/:id/books", auth, (req, res) => {
    try {
        const userId = req.auth.userId;
        Book.find({ userId: userId })
            .then((books) => {
                if(!books) {
                    return res.status(404).json({ error: "No books found for this user" , debug:"userRoutes.js line 20"});
                } else {
                    res.status(200).json(books);
                }
            })
            .catch((error) => {
                res.status(500).json({ error: "Internal server error" });
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }

});

export default router;

