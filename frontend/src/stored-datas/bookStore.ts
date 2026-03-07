import { defineStore } from 'pinia'
import axios from 'axios'

type Book = {
  _id: string
  userId: string
  title: string
  author: string
  year: number
  genre: string
  ratings: { userId: string; userRated: number }[]
  imageUrl: string
  averageRating: number
};

export const useBookStore = defineStore('book', {
  state: () => ({
    currentBook: null as Book | null
  }),
  actions: {
    async fetchBook(id: string) {
      console.log('Fetching book with ID:', id)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/books/${id}`)
      this.currentBook = response.data
    },
    clearBook() {
      console.log('Clearing book')
      this.currentBook = null
    }
  }
});


