var likeBtn = document.querySelector(".likeBtn");
var hateBtn = document.querySelector(".hateBtn");
var points = document.querySelector(".points");
var favoriteBtn = document.querySelector(".favoriteBtn");
var favList = document.querySelector("#favList");

var liked = likeBtn.getAttribute("data-liked");
var hated = hateBtn.getAttribute("data-hated");
var favorited = favoriteBtn.getAttribute("data-favorited");

likeBtn.addEventListener("click", function(){
    console.log(liked);
    if (liked == 'true'){
        liked = 'false';
        likeBtn.style.color = 'black';
    } else {
        liked = 'true';
        hated = 'false';
        likeBtn.style.color = '#0066ff';
        hateBtn.style.color = 'black';
    }
    ajaxLikeCall(null, 'like');
});
hateBtn.addEventListener("click", function(){
    if (hated == 'true'){
        hated = 'false';
        hateBtn.style.color = 'black';
    } else {
        hated = 'true';
        liked = 'false';
        hateBtn.style.color = '#0066ff';
        likeBtn.style.color = 'black';
    }
    ajaxLikeCall(null, 'hate');
});
favoriteBtn.addEventListener("click", function(){
    if (favorited == 'true'){
        favorited = 'false';
        favoriteBtn.style.color = 'black';
        favList.style.display = 'none';
    } else {
        favorited = 'true';
        favoriteBtn.style.color = '#0066ff';
        favList.style.display = 'inline';
    }
    ajaxFavoriteCall();
});

function ajaxLikeCall(e, button){
    axios.post("/api/like", {
        postId: details.getAttribute("data-postId"),
        button: button
    })
        .then(function(res){
            points.textContent = res.data.points;
        })
}

function ajaxFavoriteCall(e, changeList) {
    axios.post("/api/favorite", {
        postId: details.getAttribute("data-postId"),
        button: 'favorite',
        list: favList.value,
        changeList: changeList
    })
        .then(function(res){
            if(res.data.favorited){
                favoriteBtn.style.color = '#0066ff';
                favList.style.display = 'inline';
            } else {
                favoriteBtn.style.color = 'black';
                favList.style.display = 'none';
            }
        })
}