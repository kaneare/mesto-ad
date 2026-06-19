export const likeCard = (
  likeButton,
  likesArray,
  currentUserId,
  likeCountElement
) => {
  const isLiked = likesArray.some((like) => like._id === currentUserId);

  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  } else {
    likeButton.classList.remove("card__like-button_is-active");
  }

  if (likeCountElement) {
    likeCountElement.textContent = likesArray.length;
  }
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, currentUserId }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCountElement = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete"
  );
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  likeCard(
    likeButton,
    data.likes,
    currentUserId,
    likeCountElement
  );

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => {
      const isLiked = likeButton.classList.contains(
        "card__like-button_is-active"
      );

      onLikeIcon(likeButton, data._id, likeCountElement, isLiked);
    });
  }

  if (currentUserId === data.owner._id) {
    if (onDeleteCard) {
      deleteButton.addEventListener("click", () =>
        onDeleteCard(data._id, cardElement)
      );
    }
  } else {
    deleteButton.remove();
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link })
    );
  }

  return cardElement;
};