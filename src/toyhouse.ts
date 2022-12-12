/**
 * @file Scripts to run against the toyhouse website.
 * These are DOM scripts that should be used with puppeteer
 * eval et al.
 */

import { Field, GalleryImage } from "./util/db";

/**
 * Selector to grab the username field on the homepage
 */
export const usernameFieldSelector = "input[name=username]";

export const homePage = {
  usernameFieldSelector,
  login: (username: string, password: string) => {
    const usernameField = document.querySelector(
      "input[name=username]" as "input"
    );
    const passwordField = document.querySelector(
      "input[name=password]" as "input"
    );
    usernameField!.value = username;
    passwordField!.value = password;
    usernameField!.form!.submit();
  },
  isLoggedIn: () => Boolean(document.getElementById("app")),
  getNavLinkUrl,
};

export const allCharacterList = {
  getPageCount: () => {
    const paginationLinks = document.querySelectorAll<HTMLAnchorElement>(
      ".user-characters-gallery .characters-gallery-pagination .pagination-wrapper ul.pagination li.page-item a.page-link"
    );

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
  pageHasCharacters: () =>
    Boolean(
      document.querySelector(
        "div.user-characters-gallery p.characters-gallery-none"
      )
    ),
  getCharactersFromPage: () => {
    const items = document.querySelectorAll<HTMLDivElement>(
      ".characters-gallery .gallery-item"
    );

    const result: { name: string; url: string }[] = [];

    for (const item of items) {
      const nameBadge = item.querySelector<HTMLAnchorElement>(
        "a.character-name-badge"
      );
      if (nameBadge) {
        result.push({
          name: nameBadge.textContent!,
          url: nameBadge.href,
        });
      }
    }

    return result;
  },
};

function getNavLinkUrl(text: string): string | null {
  const links = document.querySelectorAll<HTMLAnchorElement>(
    "#dropdownProfile a.dropdown-item"
  );
  for (const link of links) {
    if (link.textContent === text) {
      return link.href;
    }
  }
  return null;
}

export const characterPage = {
  getName: () => {
    return document.querySelector(".profile-name-info h1")!.textContent;
  },
  getProfileContents: () => {
    return document.querySelector(".profile-content-content")?.innerHTML.trim();
  },
  getFields: () => {
    const result: Field[] = [];
    const fields = document.querySelectorAll(
      ".profile-fields-section .fields .fields-field"
    );
    for (const field of fields) {
      const name =
        field.querySelector("dt.field-title")?.innerHTML.trim() ?? "";
      const value =
        field.querySelector("dd.field-value")?.innerHTML.trim() ?? "";

      result.push({ name, value });
    }
    return result;
  },
  getFolderUrl: () => {
    const el = document.querySelector<HTMLAnchorElement>(
      ".side-nav > .character-folder > a"
    );
    if (!el) {
      return null;
    }
    return el.href;
  },
};

export const gallery = {
  getImages: () => {
    const elements = document.querySelectorAll<HTMLDivElement>(
      ".character-image-gallery .magnific-gallery .gallery-item div.gallery-thumb"
    );
    const result: GalleryImage[] = [];
    for (const el of elements) {
      const fullLink = el.querySelector<HTMLAnchorElement>(
        ":scope > .thumb-image > a.img-thumbnail"
      );

      const creditsElement = el.querySelector(".image-credits")!;
      const uploadDate = creditsElement.querySelector(
        ":scope > .mb-1:first-of-type"
      )!.textContent!;
      const credits = [
        ...creditsElement.querySelectorAll(".artist-credit"),
      ].map((e) => e.innerHTML.trim());

      const galleryRoot = findAncestorMatching(
        el,
        ".character-image-subgallery"
      );

      const galleryTitle = galleryRoot?.querySelector<HTMLAnchorElement>(
        ".image-subgallery-header .image-subgallery-title a"
      );

      const galleryImage: GalleryImage = {
        url: fullLink!.href,
        credits,
        uploadDate,
        subGalleryName: galleryTitle?.textContent ?? null,
        subGalleryUrl: galleryTitle?.href ?? null,
      };

      result.push(galleryImage);
    }

    return result;

    function findAncestorMatching(
      el: Element | null,
      selector: string
    ): Element | null {
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

export function extractCharacterIdFromUrl(url: string) {
  const result = toyhouseCharacterUrlPattern.exec(url);
  if (!result) return null;
  return result.groups?.id;
}
