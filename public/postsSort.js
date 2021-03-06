var grid = document.querySelector("#grid");
var userData = document.querySelector("#userData");

var lastIndex = 0;
var wait = false;
var end = false;
var pagePosition = 0;
var getFavorites = false;
var linkPhotos = false;
var user;
var photoBatch = 21;
var infoOn = [];
var timeouts = [];

var imgs;
var figures;
var iTags;
var t = 0;
var x = 0;
var height = [];
var width = [];

if(userData.getAttribute("data-username") != undefined){
    user = userData.getAttribute("data-username");
}
if(userData.getAttribute("data-getFavorites") == 'true'){
    getFavorites = true;
}
if(userData.getAttribute("data-linkPhotos") != undefined){
    linkPhotos = userData.getAttribute("data-linkPhotos");
}


function makeAJAXRequest(e, loadMore) {
    axios.post("/api/sort", {
        loadMore: loadMore,
        user: user,
        getFavorites: getFavorites,
        linkPhotos: linkPhotos
    })
        .then(function(res){
            if(usingPhotosList == false){
                pagePosition = window.pageYOffset;
            } else {
                pagePosition = photosList.scrollTop;
            }
            //sessionStorage.index = res.data.currentIndex;
            if(res.data.end){
                end = res.data.end;
                if(res.data.currentIndex - photoBatch != lastIndex){
                    photoBatch = res.data.currentIndex - lastIndex;
                } else {
                    lastIndex = res.data.currentIndex;
                }
            }
            applyPosts(res.data, true, loadMore)
        })
}

if(sessionStorage.dataSave == undefined || sessionStorage.dataSave == false){
    //sessionStorage.dataSave = false;
    //sessionStorage.posts = "";
    applyPosts({}, false);
} else {
    grid.innerHTML = sessionStorage.posts;
    window.scrollTo(0, sessionStorage.pagePosition);
}

function applyPosts(res, ajax, loadMore){
    if(ajax){
        if(!loadMore) {
            end = false;
            grid.style.display = 'flex';
            grid.innerHTML = '';
        }
        //grid.classList.add('grid-default');
        //grid.classList.remove('grid');
        grid.innerHTML += res.html;
        //sessionStorage.posts = grid.innerHTML;
        setTimeout(function(){
            setupLayout(res.currentIndex);
        }, 100);
    } else {
        grid.innerHTML = grid.getAttribute("data-posts");
        //sessionStorage.posts = grid.innerHTML;
        setTimeout(function(){
            setupLayout(grid.getAttribute("data-index"));
        }, 100);
    }
}

function setupLayout(i){
    imgs = document.querySelectorAll("img");
    figures = document.querySelectorAll("figure");
    iTags = document.querySelectorAll("i");

    t = i - photoBatch;
    x = i - photoBatch;
    if((i - photoBatch) < 0 ){
        t = 0;
        x = 0;
    } else {
        t = i - photoBatch;
        x = i - photoBatch;
    }

    for(t; t < imgs.length; t++){
        checkNaturalDimensions(t);
    }
}

function checkNaturalDimensions(i){
    height[i] = parseInt(imgs[i].naturalHeight);
    width[i] = parseInt(imgs[i].naturalWidth);

    if(height[i] == 0 || width[i] == 0){
        setTimeout(function(){
            checkNaturalDimensions(i);
        }, 250)
    } else {
        applyImageProperties(i);
    }
}

function applyImageProperties(x){
    var h = height[x];
    var w = width[x];
    var flexGrow = (w * 100) / h;
    var size = 245;
    if(window.matchMedia('(max-width: 1150px) and (orientation: portrait) and (max-resolution: 220dpi), (max-width: 1150px) and (max-resolution: 220dpi) and (max-aspect-ratio: 13/9), (min-width: 1151px) and (orientation: portrait) and (min-resolution: 221dpi), (min-width: 1151px) and (min-resolution: 221dpi) and (max-aspect-ratio: 13/9)').matches){
        size = 250;
    }
    if(window.matchMedia('(max-width: 1150px) and (min-resolution: 220dpi) and (orientation: portrait)').matches){
        size = 300;
    }
    if(userData.getAttribute("data-rowSize") != undefined){
        size = parseInt(userData.getAttribute("data-rowSize"));
    }
    var flexBasis = (w * size) / h;
    var paddingBottom = (h / w) * 100;
    var src = imgs[x].getAttribute("src");

    imgs[x].style.opacity = 0;

    figures[x].style.flexGrow = flexGrow;
    figures[x].style.flexBasis = flexBasis + "px";
    figures[x].style.backgroundImage = 'url('+src+')';
    iTags[x].style.paddingBottom = paddingBottom + '%';

    configureHoverEffects(x);
    //grid.classList.remove('grid-default');
    if(usingPhotosList == false){
        window.scrollTo(window.pageXOffset, pagePosition);
    } else {
        photosList.scrollTo(0, pagePosition);
        addImageEvents();
    }
    unpauseRequests(false);
}

function unpauseRequests(extendWait){
    if(extendWait){
        wait = true;
        setTimeout(function(){
            wait = false;
        }, 500)
    } else {
        wait = false;
    }
}

function configureHoverEffects(n){
    var newlyLoaded = document.querySelectorAll(".newly-loaded")[n];

        infoOn.push(false);

        var header = newlyLoaded.querySelector(".post-hover-header");
        var info = newlyLoaded.querySelector(".post-hover-info");
        var footer = newlyLoaded.querySelector(".post-hover-footer");
        var footerLeft = newlyLoaded.querySelector(".hover-footer-left");
        var footerRight = newlyLoaded.querySelector(".hover-footer-right");

        infoSetup(newlyLoaded, n, info, header, footer, footerLeft, footerRight);
}

function infoSetup(post, index, info, header, footer, footerLeft, footerRight){
    if(document.querySelector("body").classList.contains("mobile")){
        info.style.display = 'inline-block';
        header.style.paddingRight = '40px';
        info.addEventListener("click", function(){
            if(infoOn[index]){
                hideInfo(header, footer, footerLeft, footerRight);
                infoOn[index] = false;
            } else {
                if(timeouts[index] != undefined){
                    clearTimeout(timeouts[index]);
                }
                showInfo(true, post, header, footer, footerLeft, footerRight);
                for(let i = 0; i < infoOn.length; i++){
                    infoOn[i] = false;
                }
                infoOn[index] = true;
                timeouts[index] = setTimeout(function(){
                    infoOn[index] = false;
                    hideInfo(header, footer, footerLeft, footerRight);
                }, 3500);
            }
        })
    }

    post.addEventListener("mouseenter", function(){
        console.log("mouse enter");
        showInfo(false, post, header, footer, footerLeft, footerRight);
    })
    post.addEventListener("mouseleave", function(){
        hideInfo(header, footer, footerLeft, footerRight);
    })
}

function showInfo(isMobile, post, header, footer, footerLeft, footerRight){
    header.style.display = "block";
    footer.style.display = "flex";
    if(isMobile){
        header.style.transition = "opacity .1s linear";
        footer.style.transition = "opacity .1s linear";
    } else{
        header.style.transition = "opacity .35s linear";
        footer.style.transition = "opacity .35s linear";
    }
    footerLeft.querySelector(".hover-footer-author").style.display = "inline-block";

    if(post.getAttribute("data-isauthor") == 'yes'){
        var html = '';
        html += '<span class="hover-delete-confirm">Are you sure?</span>';
        html += '<span class="hover-delete">Delete</span>';
        html += '<span class="hover-delete-yes">Yes</span><span class="hover-delete-no">No</span>';
        footerRight.innerHTML = html;

        var footerDelete = footerRight.querySelector(".hover-delete");
        footerDelete.addEventListener("click", function(){
            footerLeft.style.width = "0";
            footerRight.style.width = "100%";
            footerRight.style.display = "inline-flex";
            footerRight.style.justifyContent = "space-evenly";
            var footerYes = footerRight.querySelector(".hover-delete-yes");
            var footerNo = footerRight.querySelector(".hover-delete-no");
            var footerAuthor = footerLeft.querySelector(".hover-footer-author");
            var footerConfirm = footerRight.querySelector(".hover-delete-confirm");
            footerDelete.style.display = "none";
            footerYes.style.display = "inline-block";
            footerNo.style.display = "inline-block";
            footerAuthor.style.display = "none";
            footerConfirm.style.display = "inline-block";

            footerNo.addEventListener("click", function(){
                footerLeft.style.width = "49%";
                footerRight.style.width = "49%";
                footerRight.style.display = "inline-block";
                footerDelete.style.display = "inline-block";
                footerYes.style.display = "none";
                footerNo.style.display = "none";
                footerAuthor.style.display = "inline-block";
                footerConfirm.style.display = "none";
            })
            footerYes.addEventListener("click", function(){
                axios.delete("/api/home/" + post.querySelectorAll("a")[1].getAttribute("data-id"));
                post.outerHTML = '';
            })
        })
    } else {
        footerRight.textContent = post.getAttribute("data-country");
    }
}

function hideInfo(header, footer, footerLeft, footerRight){
    footerLeft.style.width = "49%";
    footerRight.style.width = "49%";
    footerRight.style.display = "inline-block";
    header.style.display = "none";
    header.style.transition = "0s";
    footer.style.display = "none";
    footer.style.transition = "0s";
}