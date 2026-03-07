
import  HomePage  from "./pages/HomePage.vue";
import  AuthentificationPage  from "./pages/AuthentificationPage.vue";
import  BookPage  from "./pages/BookPage.vue";
import  UpdateBookPage  from "./pages/UpdateBookPage.vue";
import  UploadBookPage  from "./pages/UploadBookPage.vue";
import DeletedBookPage from "./pages/DeletedBookPage.vue";

const routes = [
    { path: '/', name: 'HomePage', component: HomePage },
    { path: '/authentification', name: 'AuthentificationPage',component: AuthentificationPage },
    { path: '/upload', name: 'UploadBookPage',component: UploadBookPage },
    { path: '/books/deleted', name: 'DeletedBookPage',component: DeletedBookPage },
    { path: '/books/:id', name: 'BookPage', component: BookPage },
    { path: '/books/:id/edit', name: 'UpdateBookPage',component: UpdateBookPage },
  ];
  
  
  // {
  //   path: '/books',
  //   name: 'Books',
  //   component: BooksLayout,
  //   children: [
  //     { path: 'deleted', name: 'DeletedBooks', component: DeletedBookPage },
  //     { path: 'upload', name: 'BookUpload', component: UploadBookPage },
  //     { path: ':id', name: 'BookDetails', component: BookPage },
  //     { path: ':id/edit', name: 'BookEdit', component: UpdateBookPage },
  //   ]
  // }

  export default routes;
