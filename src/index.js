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
  submitBtn: document.querySelector('#submit'),
  loadMoreBtn: document.querySelector('.load-more'),
  gallery: document.querySelector('.gallery'),
};

refs.searchForm.addEventListener('submit', onSubmit);
refs.loadMoreBtn.addEventListener('click', onClickLoadMore);
refs.submitBtn.addEventListener('submit', onClickSubmit);

function onClickSubmit() {}

class Images {
  constructor() {
    this.searchQuery = '';
    this.totalPage = 1;
    this.newQuery = '';
  }

  async onGetImages() {
    try {
      const serverAnswer = await axios.get(
        `${BASE_URL}?key=${KEY_API}&q=${this.searchQuery}${SEARCHPARAMS}&per_page=${PAGINATION_PAGES}&page=${this.totalPage}`
      );

      const serverImage = await serverAnswer.data;
      this.serverAnswer = serverAnswer;
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
  newImages.resetPage();
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
      refs.loadMoreBtn.setAttribute('hidden', true);
      Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }

    onMarkupImages(serverImage.hits);
  });
}

async function onMarkupImages(images) {
  refs.loadMoreBtn.removeAttribute('hidden');

  if (!images.length) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    refs.loadMoreBtn.setAttribute('hidden', true);
    return;
  }
  const markup = images
    .map(img => {
      return ` 
      
      <div class="photo-card">
   <a class="gallery-link" href="${img.largeImageURL}">
    <img class="gallery-item" src="${img.webformatURL}" alt="${img.tags}" loading="lazy"  class="gallery__image" />
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

  refs.gallery.insertAdjacentHTML('beforeend', markup);
  imageGalleryListener();
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}

function imageGalleryListener() {
  let galleryLarge = new SimpleLightbox('.gallery a');

  refs.gallery.addEventListener('click', evt => {
    evt.preventDefault();
    galleryLarge.on('show.simplelightbox', () => {
      galleryLarge.defaultOptions.captionDelay = 250;
    });
  });
  galleryLarge.refresh();
}
