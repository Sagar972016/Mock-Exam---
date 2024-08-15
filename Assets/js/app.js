const cl =console.log;

const movieContainer =document.getElementById('movieContainer');
const backDropId = document.getElementById('backDropId');
const movieModalId = document.getElementById('movieModalId');
const addMovieBtn = document.getElementById('addMovieBtn');
const movieForm=document.getElementById('movieForm');
const titleControl=document.getElementById('title');
const loader = document.getElementById("loader")
const imageUrlControl=document.getElementById('imageUrl');
const ratingControl=document.getElementById('rating');
const contentControl=document.getElementById('content');

const movieSubmitBtn=document.getElementById('movieSubmitBtnId');
const movieUpdateBtn=document.getElementById('movieUpdateBtnId');
const movieCloseBtns =[...document.querySelectorAll('.movieClose')];


const BASE_URL = `https://b14-922cd-default-rtdb.asia-southeast1.firebasedatabase.app/`;
const POST_URL = `${BASE_URL}/posts.json`; 

let sweetalert = (A, B , C = null) => {
   swal.fire({
       title : A,
       timer : 4000,
       icon : B,
       buttonColor : "#007bff"
   })
}

let moviesArr = [];

const createMovieCards=(arr)=>{

   let result = [];

   arr.forEach(movie =>{  
      if(movie.rating > 0 && movie.rating <=2)
         {
             voteAverageColor="bg-danger";
         }
      else if(movie.rating > 2 && movie.rating <= 3)
         {
             voteAverageColor="bg-warning";
         }
      else if(movie.rating >= 4 && movie.rating <= 5){
            voteAverageColor="bg-success";
         } 
      result += `
         <div class="col-md-4 mb-4">
               <div class="card movieCard" id = "${movie.id}">
                  <figure class="m-0">
                     <img src = "${movie.imageUrl}" alt="" title="">

                     <figcaption>
                        <h2 class="h2 font-weight-bold">${movie.title}</h2>
                        <strong class="p-1 ratingColor ${voteAverageColor}">Rating : <i class="fa-regular fa-star"></i> ${movie.rating}/5</strong>
                        <p class="content">${movie.content}</p>

                        <div class="d-flex justify-content-between">
                           <button class="btn btn-sm nfx-btn bg-light" onclick="onMovieEdit(this)">EDIT</button>
                           <button class="btn btn-sm nfx-btn text-white" onclick="onMovieRemove(this)">REMOVE</button>
                        </div>
                     </figcaption>
                  </figure>
               </div>
         </div>
      `
    movieContainer.innerHTML =result;
})
}

const toggleModalBackDrop=() =>{
   backDropId.classList.toggle('visible');
   movieModalId.classList.toggle('visible');
   movieUpdateBtn.classList.add('d-none');
   movieSubmitBtn.classList.remove('d-none');

   movieForm.reset();
}

const makeApiCall = (method_Name, API_URL, msgBody) => {
   // loader.classList.remove("d-none");

   msgBody = msgBody ? JSON.stringify(msgBody) : null

   loader.classList.remove('d-none')
   return fetch(API_URL, {
       method : method_Name,
       body : msgBody,
       headers : {
           token : "Get a JWT Token from local storage"
       }
   })
   .then((res) => {
       return res.json()
   })
}

const fetchAll = () => {
      makeApiCall('GET', POST_URL)
      .then((data) => {
         cl(data)
         
         for(const key in data){
            moviesArr.unshift({...data[key], id:key})
         }
         cl(moviesArr)
         createMovieCards(moviesArr)              
      })
      .catch((err) => {
         sweetalert(err, 'error')
      })
      .finally(() => {
         loader.classList.add("d-none");
      })
}
fetchAll()



const onMovieEdit = (ele)=>{

   let EDIT_ID = ele.closest(".card").id;
   let EDIT_URL = `${BASE_URL}/posts/${EDIT_ID}.json`
   
   localStorage.setItem('EDIT_ID', EDIT_ID);

   makeApiCall("GET", EDIT_URL)
         .then((res) => {
            titleControl.value = res.title;
            contentControl.value = res.content;
            imageUrlControl.value = res.imageUrl;
            ratingControl.value =res.rating;

            movieUpdateBtn.classList.remove('d-none');
            movieSubmitBtn.classList.add('d-none');

         })
         .catch((err) => {
            sweetalert(err, 'error')
         })
         .finally(() => {
              loader.classList.add("d-none");
          })
         
   toggleModalBackDrop();  
}

const onMovieUpdate = (eve)=>{
   let update_Id = localStorage.getItem('EDIT_ID');
   let updated_url = `${BASE_URL}/posts/${update_Id}.json`
   let update_Obj = {
      title : titleControl.value,
      imageUrl : imageUrlControl.value,
      content : contentControl.value,
      rating : ratingControl.value,
   } 
   

   makeApiCall("PATCH", updated_url, update_Obj)
         .then(res=>{
            //cl(res)
            let card = document.getElementById(update_Id)
            card.innerHTML=`
                  <figure class="m-0">
                     <img src = "${update_Obj.imageUrl}" alt="" title="">
         
                     <figcaption>
                        <h2 class="h2 font-weight-bold">${update_Obj.title}</h2>
                        <strong class="p-1 ratingColor ${voteAverageColor}">Rating : <i class="fa-regular fa-star"></i> ${update_Obj.rating}/5</strong>
                        <p class="content">${update_Obj.content}</p>
         
                        <div class="d-flex justify-content-between">
                           <button class="btn btn-sm nfx-btn bg-light" onclick="onMovieEdit(this)">EDIT</button>
                           <button class="btn btn-sm nfx-btn text-white" onclick="onMovieRemove(this)">REMOVE</button>
                        </div>
                     </figcaption>
                  </figure>
            
            `           
            sweetalert("MOVIE UPDATED SUCCESSFULLYY!!","success")
         })
         .catch((err) => {
            sweetalert(err, "error");
         })
         .finally(() => {
               loader.classList.add("d-none");
         })         
         
   toggleModalBackDrop();
   
}

const onMovieRemove = (ele) => {
 
   Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "rgb(229,9,20)",
      cancelButtonColor: "rgb(20, 110, 230)",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {

         let REMOVE_ID = ele.closest(".card").id;
         let REMOVE_URL = `${BASE_URL}/posts/${REMOVE_ID}.json`;
         
         makeApiCall("DELETE", REMOVE_URL)
               .then((res) => {
                  ele.closest(".card").parentElement.remove();
               })
               .catch((err) => {
                  sweetalert(err, "error")
               })
               .finally(() => {
                  loader.classList.add("d-none");
               }) 

        Swal.fire({
          title: "REMOVED !!!",
          text: "Movie has been Removed.",
          icon: "success",
          confirmButtonColor : "#e50914"
        });
      }else{
         loader.classList.add("d-none");
      }
    });
}

const onMovieAdd = (eve)=>{
   
   eve.preventDefault();
   let movieObj ={
      title: titleControl.value,
      imageUrl:imageUrlControl.value,
      content:contentControl.value,
      rating:ratingControl.value,
   }
   cl(movieObj);

   makeApiCall("POST", POST_URL, movieObj) 
         .then(data => {
            cl(data);
            let div = document.createElement("div");
            div.className = "col-md-4 mb-4";
            movieObj.id = data.name;
            cl(movieObj)
            div.innerHTML = `
                        <div class="card movieCard" id="${movieObj.id}">
                           <figure class="m-0">
                              <img src = "${movieObj.imageUrl}" alt="" title="">

                              <figcaption>
                                 <h2 class="h2 font-weight-bold">${movieObj.title}</h2>
                                 <strong class="p-1 ratingColor ${voteAverageColor}">Rating : <i class="fa-regular fa-star"></i> ${movieObj.rating}/5</strong>
                                 <p class="content">
                                    ${movieObj.content}
                                 </p>
                                 <div class="d-flex justify-content-between">
                                    <button class="btn btn-sm nfx-btn bg-light" onclick="onMovieEdit(this)">EDIT</button>
                                    <button class="btn btn-sm nfx-btn text-white" onclick="onMovieRemove(this)">REMOVE</button>
                                 </div>
                              </figcaption>
                           </figure>
                        </div>
                     `
            movieContainer.prepend(div);
            // sweetalert("New Movie Is Added Successfully !!!", "success");
            Swal.fire({
               title: `Movie by name ${movieObj.title} is added`,
               timer: 4000,
               icon: "success",
               confirmButtonColor : "#007bff"
             });

      })
      .catch((err) => {
            sweetalert(err, 'error')
      })
      .finally(() => {
            loader.classList.add("d-none");           
      })
      
   
   toggleModalBackDrop();
   
}




movieCloseBtns.forEach(btn=>{
    btn.addEventListener('click',toggleModalBackDrop);
})
addMovieBtn.addEventListener('click',toggleModalBackDrop);
movieForm.addEventListener('submit',onMovieAdd);
movieUpdateBtn.addEventListener('click',onMovieUpdate);






