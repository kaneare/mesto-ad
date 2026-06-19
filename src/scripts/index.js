import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
   setCloseModalWindowEventListeners,
} from "./components/modal.js";
import {
  enableValidation,
  clearValidation,
  enableSubmitButton,
  disableSubmitButton,
} from "./components/validation.js";
import {
  getUserInfo,
  setUserInfo,
  setUserAvatar,
  getCardList,
  createNewCard,
  deleteCardOnServer,
  changeLikeCardStatus,
} from "./components/api.js";

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);
const profileSubmitButton = profileForm.querySelector(".popup__button");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardSubmitButton = cardForm.querySelector(".popup__button");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarSubmitButton = avatarForm.querySelector(".popup__button");

const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsModalInfoList = document.querySelector(".popup__info");
const usersStatsModalUserList = document.querySelector(".popup__list");
const popupTitle = usersStatsModalWindow.querySelector(".popup__title");
const popupText = usersStatsModalWindow.querySelector(".popup__text");

const logoElement = document.querySelector(".header__logo");

let currentUserId = null;

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);

const handleError = (err) => {
  console.log(err);
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const updateUserInfo = (userData) => {
  profileTitle.textContent = userData.name;
  profileDescription.textContent = userData.about;
  profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
  currentUserId = userData._id;
};

const setButtonLoading = (button, isLoading, loadingText, originalText) => {
  if (isLoading) {
    button.textContent = loadingText;
    disableSubmitButton(button, validationSettings);
  } else {
    button.textContent = originalText;
    enableSubmitButton(button, validationSettings);
  }
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  const originalText = profileSubmitButton.textContent;
  setButtonLoading(profileSubmitButton, true, "Сохранение...", originalText);

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch(handleError)
    .finally(() => {
      setButtonLoading(
        profileSubmitButton,
        false,
        "Сохранение...",
        originalText
      );
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();

  const originalText = avatarSubmitButton.textContent;
  setButtonLoading(avatarSubmitButton, true, "Сохранение...", originalText);

  setUserAvatar({
    avatar: avatarInput.value,
  })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch(handleError)
    .finally(() => {
      setButtonLoading(
        avatarSubmitButton,
        false,
        "Сохранение...",
        originalText
      );
    });
};

const handleDeleteCard = (cardID, cardElement) => {
  deleteCardOnServer(cardID)
    .then(() => {
      deleteCard(cardElement);
    })
    .catch(handleError);
};

const handleLikeIcon = (likeButton, cardID, likeCountElement, isLiked) => {
  changeLikeCardStatus(cardID, isLiked)
    .then((updatedCard) => {
      likeCard(likeButton, updatedCard.likes, currentUserId, likeCountElement);
    })
    .catch(handleError);
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  const originalText = cardSubmitButton.textContent;
  setButtonLoading(cardSubmitButton, true, "Создание...", originalText);

  createNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCard) => {
      placesWrap.prepend(
        createCardElement(newCard, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeIcon,
          onDeleteCard: handleDeleteCard,
          currentUserId,
        })
      );

      closeModalWindow(cardFormModalWindow);
    })
    .catch(handleError)
    .finally(() => {
      setButtonLoading(cardSubmitButton, false, "Создание...", originalText);
    });
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (label, value) => {
  const template = document.querySelector(
    "#popup-info-definition-template",
  ).content;
  const infoItem = template.cloneNode(true);
  infoItem.querySelector(".popup__info-term").textContent = label;
  infoItem.querySelector(".popup__info-description").textContent = value;
  return infoItem;
};

const createUserPreview = (userData) => {
  const template = document.querySelector(
    "#popup-info-user-preview-template",
  ).content;
  const userItem = template.cloneNode(true);
  const listItem = userItem.querySelector(".popup__list-item_type_badge");
  listItem.textContent = userData.name;
  return listItem;
};

const handleLogoClick = () => {
  popupTitle.textContent = "Статистика пользователей";
  popupText.textContent = "Все пользователи";

  usersStatsModalInfoList.replaceChildren();
  usersStatsModalUserList.replaceChildren();

  getCardList()
    .then((cards) => {
      const totalCards = cards.length;
      usersStatsModalInfoList.append(
        createInfoString("Всего карточек:", totalCards.toString()),
      );

      if (totalCards > 0) {
        const dates = cards.map((card) => new Date(card.createdAt));
        const oldestDate = new Date(Math.min(...dates));
        const newestDate = new Date(Math.max(...dates));

        usersStatsModalInfoList.append(
          createInfoString("Первая создана:", formatDate(oldestDate)),
        );
        usersStatsModalInfoList.append(
          createInfoString("Последняя создана:", formatDate(newestDate)),
        );
      }

      const usersMap = new Map();
      cards.forEach((card) => {
        const owner = card.owner;
        if (!usersMap.has(owner._id)) {
          usersMap.set(owner._id, {
            id: owner._id,
            name: owner.name,
            cardsCount: 0,
          });
        }
        usersMap.get(owner._id).cardsCount++;
      });

      const totalUsers = usersMap.size;
      usersStatsModalInfoList.append(
        createInfoString("Всего пользователей:", totalUsers.toString()),
      );

      let maxCards = 0;
      usersMap.forEach((user) => {
        if (user.cardsCount > maxCards) {
          maxCards = user.cardsCount;
        }
      });
      usersStatsModalInfoList.append(
        createInfoString("Максимум карточек от одного:", maxCards.toString()),
      );

      usersMap.forEach((user) => {
        usersStatsModalUserList.append(createUserPreview(user));
      });

      openModalWindow(usersStatsModalWindow);
    })
    .catch(handleError);
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

logoElement.addEventListener("click", handleLogoClick);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;

  clearValidation(profileForm, validationSettings);

  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();

  clearValidation(avatarForm, validationSettings);

  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();

  clearValidation(cardForm, validationSettings);

  openModalWindow(cardFormModalWindow);
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    updateUserInfo(userData);
    cards.forEach((data) => {
      placesWrap.append(
        createCardElement(data, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeIcon,
          onDeleteCard: handleDeleteCard,
          currentUserId: currentUserId,
        }),
      );
    });
  })
  .catch(handleError);
