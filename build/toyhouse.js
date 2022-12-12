"use strict";
/**
 * @file Scripts to run against the toyhouse website.
 * These are DOM scripts that should be used with puppeteer
 * eval et al.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCharacterIdFromUrl = exports.gallery = exports.characterPage = exports.allCharacterList = exports.homePage = exports.usernameFieldSelector = void 0;
/**
 * Selector to grab the username field on the homepage
 */
exports.usernameFieldSelector = "input[name=username]";
exports.homePage = {
    usernameFieldSelector: exports.usernameFieldSelector,
    login: (username, password) => {
        const usernameField = document.querySelector("input[name=username]");
        const passwordField = document.querySelector("input[name=password]");
        usernameField.value = username;
        passwordField.value = password;
        usernameField.form.submit();
    },
    isLoggedIn: () => Boolean(document.getElementById("app")),
    getNavLinkUrl,
};
exports.allCharacterList = {
    getPageCount: () => {
        const paginationLinks = document.querySelectorAll(".user-characters-gallery .characters-gallery-pagination .pagination-wrapper ul.pagination li.page-item a.page-link");
        let max = 0;
        for (const link of paginationLinks) {
            const text = link.textContent || "";
            if (/^[0-9]+$/.test(text)) {
                const pageNumber = parseInt(text, 10);
                if (pageNumber > max) {
                    max = pageNumber;
                }
            }
        }
        return max;
    },
    pageHasCharacters: () => Boolean(document.querySelector("div.user-characters-gallery p.characters-gallery-none")),
    getCharactersFromPage: () => {
        const items = document.querySelectorAll(".characters-gallery .gallery-item");
        const result = [];
        for (const item of items) {
            const nameBadge = item.querySelector("a.character-name-badge");
            if (nameBadge) {
                result.push({
                    name: nameBadge.textContent,
                    url: nameBadge.href,
                });
            }
        }
        return result;
    },
};
function getNavLinkUrl(text) {
    const links = document.querySelectorAll("#dropdownProfile a.dropdown-item");
    for (const link of links) {
        if (link.textContent === text) {
            return link.href;
        }
    }
    return null;
}
exports.characterPage = {
    getName: () => {
        return document.querySelector(".profile-name-info h1").textContent;
    },
    getProfileContents: () => {
        return document.querySelector(".profile-content-content")?.innerHTML.trim();
    },
    getFields: () => {
        const result = [];
        const fields = document.querySelectorAll(".profile-fields-section .fields .fields-field");
        for (const field of fields) {
            const name = field.querySelector("dt.field-title")?.innerHTML.trim() ?? "";
            const value = field.querySelector("dd.field-value")?.innerHTML.trim() ?? "";
            result.push({ name, value });
        }
        return result;
    },
    getFolderUrl: () => {
        const el = document.querySelector(".side-nav > .character-folder > a");
        if (!el) {
            return null;
        }
        return el.href;
    },
};
exports.gallery = {
    getImages: () => {
        const elements = document.querySelectorAll(".character-image-gallery .magnific-gallery .gallery-item div.gallery-thumb");
        const result = [];
        for (const el of elements) {
            const fullLink = el.querySelector(":scope > .thumb-image > a.img-thumbnail");
            const creditsElement = el.querySelector(".image-credits");
            const uploadDate = creditsElement.querySelector(":scope > .mb-1:first-of-type").textContent;
            const credits = [
                ...creditsElement.querySelectorAll(".artist-credit"),
            ].map((e) => e.innerHTML.trim());
            const galleryRoot = findAncestorMatching(el, ".character-image-subgallery");
            const galleryTitle = galleryRoot?.querySelector(".image-subgallery-header .image-subgallery-title a");
            const galleryImage = {
                url: fullLink.href,
                credits,
                uploadDate,
                subGalleryName: galleryTitle?.textContent ?? null,
                subGalleryUrl: galleryTitle?.href ?? null,
            };
            result.push(galleryImage);
        }
        return result;
        function findAncestorMatching(el, selector) {
            if (!el) {
                return null;
            }
            if (el.matches(selector)) {
                return el;
            }
            return findAncestorMatching(el.parentElement, selector);
        }
    },
};
const toyhouseCharacterUrlPattern = /^https:\/\/toyhou.se\/(?<id>\d+)\..*$/;
function extractCharacterIdFromUrl(url) {
    const result = toyhouseCharacterUrlPattern.exec(url);
    if (!result)
        return null;
    return result.groups?.id;
}
exports.extractCharacterIdFromUrl = extractCharacterIdFromUrl;
