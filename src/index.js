import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const KEY_API = '30088099-938be4da0fae21d81f7b52182';
const BASE_URL = 'https://pixabay.com/api/';
const SEARCHPARAMS = '&image_type=photo&orientation=horizontal&safesearch=true';
const PAGINATION_PAGES = 40;

const refs = {
  searchForm: document.querySelector('#search-form'),
  inputForm: document.querySelector('input'),
  submitBtn: document.querySelector('#submit'),
  lodeMoreBtn: document.querySelector('.lode-more'),
  gallery: document.querySelector('.gallery'),
};

refs.lodeMoreBtn.setAttribute('disabled', 'disabled');

refs.searchForm.addEventListener('submit', onSubmit);
refs.inputForm.addEventListener('input', onInputForm);
refs.lodeMoreBtn.addEventListener('click', onClickLoadMore);
refs.submitBtn.addEventListener('submit', onClickSubmit);

// let totalPage = 1;

// let searchQuery = '';

function onClickSubmit() {}

class Images {
  constructor() {
    this.searchQuery = '';
    this.totalPage = 12;
    this.newQuery = '';
    this.serverAnswer = '';
  }

  async onGetImages() {
    try {
      const serverAnswer = await axios.get(
        `${BASE_URL}?key=${KEY_API}&q=${this.searchQuery}${SEARCHPARAMS}&per_page=${PAGINATION_PAGES}&page=${this.totalPage}`
      );

      const serverImage = await serverAnswer.data;
      console.log(serverAnswer.data.totalHits);
      this.serverAnswer = serverAnswer;
      console.log(serverImage);
      return serverImage;
    } catch {
      error => console.log('error');
    }
  }

  incrementPage() {
    this.totalPage += 1;
  }

  resetPage() {
    this.totalPage = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}

const newImages = new Images();

function onSubmit(e) {
  e.preventDefault();
  // newImages.resetPage();
  newImages.query = e.target.elements.searchQuery.value;
  clearGallery();
  newImages.onGetImages().then(serverImage => {
    onMarkupImages(serverImage.hits);
  });
}

function onClickLoadMore(e) {
  e.preventDefault();
  newImages.incrementPage();

  newImages.onGetImages().then(serverImage => {
    if (newImages.totalPage * PAGINATION_PAGES > serverImage.totalHits) {
      console.log('Thats all');
      refs.lodeMoreBtn.setAttribute('disable', 'disable');
      Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }

    onMarkupImages(serverImage.hits);
  });
}

function onInputForm(e) {
  // e.preventDefault();
  // newImages.query = e.currentTarget.value;
  // console.log(newImages.searchQuery);
  // newImages.onGetImages();
}

// newImages.onGetImages();

async function onMarkupImages(images) {
  refs.lodeMoreBtn.removeAttribute('disabled');

  if (!images.length) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    refs.lodeMoreBtn.setAttribute('disabled', 'disabled');
    return;
  }
  const markup = images
    .map(img => {
      return ` 
      
      <div class="photo-card">
   <a href="${img.largeImageURL}">
    <img src="${img.webformatURL}" alt="${img.tags}" loading="lazy"  class="gallery__image" />
    </a>
    <div class="info">
      <p class="info-item">
        <b>Likes </b><span>${img.likes}</span>
      </p>
      <p class="info-item">
        <b>Views </b><span>${img.views}</span>
      </p>
      <p class="info-item">
        <b>Comments </b><span>${img.comments}</span>
      </p>
      <p class="info-item">
        <b>Downloads </b><span>${img.downloads}</span>
      </p>
    </div>
  </div>`;
    })
    .join('');
  imageGalleryListener();

  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}

function imageGalleryListener() {
  let lightbox = new SimpleLightbox('.photo-card a', {
    captionDelay: 250,
    captionsData: 'alt',
  });
  // let galleryLarge = new SimpleLightbox('.photo-card a');

  // refs.gallery.addEventListener('click', evt => {
  //   evt.preventDefault();
  //   galleryLarge.on('show.simplelightbox', () => {
  //     galleryLarge.defaultOptions.captionDelay = 250;
  //   });
  // });
  // // galleryLarge.refresh();
}
