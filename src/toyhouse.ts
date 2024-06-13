/**
 * @file Scripts to run against the toyhouse website.
 * These are DOM scripts that should be used with puppeteer
 * evaluate and similar functions.
 *
 * Functions intended for use this way must be 100% pure,
 * as they will be stringified and evaluated in another js
 * context.
 */
import type { Field, GalleryImage } from "./util/db";

/**
 * Utilities for use on the toyhouse homepage
 *
 * @example https://toyhou.se/
 */
export const homePage = {
  /** Selector for the username field in the login dialog */
  usernameFieldSelector: "input[name=username]",
  setUsername(username: string) {
    const usernameField = document.querySelector(
      "input[name=username]" as "input"
    );
    usernameField!.value = username;
  },
  setPassword(password: string) {
    const passwordField = document.querySelector(
      "input[name=password]" as "input"
    );
    passwordField!.value = password;
  },
  clickLogin() {
    const signInButton = document.querySelector(
      "input[type=submit]" as "input"
    );
    signInButton!.click();
  },
  /**
   * Log in to toyhouse using the provided credentials
   * @param username
   * @param password
   */
  login: (username: string, password: string) => {
    const usernameField = document.querySelector(
      "input[name=username]" as "input"
    );
    const passwordField = document.querySelector(
      "input[name=password]" as "input"
    );
    const signInButton = document.querySelector(
      "input[type=submit]" as "input"
    );
    usernameField!.value = username;
    passwordField!.value = password;
    signInButton!.click();
  },
  /**
   * Determine if the user is currently logged in or not.
   * @returns true if the toyhouse app is displayed, false if the
   *  invite page is up.
   */
  isLoggedIn: () => Boolean(document.getElementById("app")),
  /**
   * Get the url from a topnav link by the link text
   * @param text The text to match. Exact match only.
   * @returns The link href, or null if not found
   */
  getNavLinkUrl: (text: string): string | null => {
    const selectors = {
      navLink: "#dropdownProfile a.dropdown-item",
    };
    const links = document.querySelectorAll<HTMLAnchorElement>(
      selectors.navLink
    );
    for (const link of links) {
      if (link.textContent === text) {
        return link.href;
      }
    }
    return null;
  },
};
/**
 * Utilities for use on the "view all" character list page.
 *
 * @example https://toyhou.se/Flipside/characters/folder:all
 */
export const allCharacterList = {
  /**
   * Get the maximum page index
   */
  getPageCount: () => {
    const paginationLinks = document.querySelectorAll<HTMLAnchorElement>(
      ".user-characters-gallery .characters-gallery-pagination .pagination-wrapper ul.pagination li.page-item a.page-link"
    );

    let max = 0;
    // PERF: Probably a way to make a selector
    // to just grab the "last page" link.
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
  /**
   * Retrieve all characters from the current page
   * @returns An array of characters on the current
   *  page
   */
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

/**
 * Utilities to be run on the toyhouse character detail
 * page.
 *
 * @example https://toyhou.se/48810.pillowing-cherish
 */
export const characterPage = {
  /**
   * Get the name of the character
   */
  getName: () => {
    return document.querySelector(".profile-name-info h1")!.textContent;
  },
  /**
   * Get the custom profile html content
   * @returns profile html, or undefined if there is none
   */
  getProfileContents: () => {
    return document.querySelector(".profile-content-content")?.innerHTML.trim();
  },
  /**
   * Get all fields and values from the page
   * @returns An array of field names and values. Values
   *  and name are html strings.
   */
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
  /**
   * Get the url for the folder that contains this character
   * @returns null if it's not in a folder, the url otherwise
   */
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

/**
 * Utilities intended to be run on the toyhouse character
 * gallery page.
 *
 * @example https://toyhou.se/48810.pillowing-cherish/gallery
 */
export const gallery = {
  /**
   * Collect information about every image in the gallery.
   * @returns An array of gallery image metadata
   */
  getImages: (): GalleryImage[] => {
    /**
     * Selectors, organized by their usage on the gallery page.
     */
    const selectors = {
      subgallery: {
        selector: ".character-image-subgallery",
        title: ".image-subgallery-header .image-subgallery-title a",
      },
      /** Individual gallery item box */
      galleryItem: {
        selector:
          ".character-image-gallery .magnific-gallery .gallery-item div.gallery-thumb",
        /** Link to full image */
        imageLink: ":scope > .thumb-image > a.img-thumbnail",
        /** Credits container box */
        credits: {
          selector: ".image-credits",
          /** A single credit line */
          credit: ".artist-credit",
          /** Image upload date container */
          uploadDate: ":scope > .mb-1:first-of-type",
        },
      },
    } as const;

    const result: GalleryImage[] = [];

    const galleryItems = document.querySelectorAll<HTMLDivElement>(
      selectors.galleryItem.selector
    );
    for (const galleryItem of galleryItems) {
      const fullLink = galleryItem.querySelector<HTMLAnchorElement>(
        selectors.galleryItem.imageLink
      );

      const creditsContainer = galleryItem.querySelector(
        selectors.galleryItem.credits.selector
      );

      const uploadDate = creditsContainer!.querySelector(
        selectors.galleryItem.credits.uploadDate
      )!.textContent!;

      const credits = [
        ...creditsContainer!.querySelectorAll(
          selectors.galleryItem.credits.credit
        ),
      ].map((e) => e.innerHTML.trim());
      const containingGallery = findAncestorMatching(
        galleryItem,
        selectors.subgallery.selector
      );

      const galleryTitleLink =
        containingGallery?.querySelector<HTMLAnchorElement>(
          selectors.subgallery.title
        );

      const galleryImage: GalleryImage = {
        url: fullLink!.href,
        credits,
        uploadDate,
        subGalleryName: galleryTitleLink?.textContent ?? null,
        subGalleryUrl: galleryTitleLink?.href ?? null,
      };

      result.push(galleryImage);
    }

    return result;

    /**
     * Find the nearest ancestor element matching the specified selector
     * @param el The element to search from
     * @param selector A css selector
     * @returns `el` or its nearest ancestor that matches `selector`.
     */
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

export interface FolderTree {
  name: string;
  id: string;
  children: FolderTree[];
}

export const foldersPage = {
  parseFolders: () => {
    const selectors = {
      folderList: {
        selector: "form > .sortable",
        folder: {
          selector: ":scope > .folder-tree-row",
          subfolder: ":scope > .sortable > .folder-tree-row",
          hiddenInput: 'input[name="f[]"]',
          link: ":scope > div > a",
        },
      },
    } as const;

    const folderList = document.querySelector<HTMLDivElement>(
      selectors.folderList.selector
    );

    const rootFolder: FolderTree = {
      name: "Unsorted",
      id: "$ROOT",
      children: [],
    };

    const folders = folderList!.querySelectorAll(
      selectors.folderList.folder.selector
    );

    let numFolders = 1;
    let resultNodeStack: FolderTree[] = [rootFolder];
    for (const folder of folders) {
      crawl(
        folder,
        (node) => {
          numFolders++;
          const idInput = node.querySelector<HTMLInputElement>(
            selectors.folderList.folder.hiddenInput
          );
          const link = node.querySelector<HTMLAnchorElement>(
            selectors.folderList.folder.link
          );
          const name = link!.textContent!.trim();
          const parentNode = resultNodeStack.at(-1);
          const newNode: FolderTree = {
            name,
            id: idInput!.value,
            children: [],
          };
          parentNode!.children.push(newNode);

          resultNodeStack.push(newNode);
        },
        () => resultNodeStack.pop()
      );
    }

    return { rootFolder, numFolders };

    function crawl(
      root: Element,
      onEnter: (node: Element) => void = () => {},
      onExit: (node: Element) => void = () => {}
    ) {
      onEnter(root);
      const children = root.querySelectorAll(
        selectors.folderList.folder.subfolder
      );
      for (const child of children) {
        crawl(child, onEnter, onExit);
      }
      onExit(root);
    }
  },
};

const toyhouseCharacterUrlPattern = /^https:\/\/toyhou.se\/(?<id>\d+)\..*$/;

/**
 * Parse an ID from a character URL. Not for use in
 * the DOM context.
 * @param url
 * @returns
 */
export function extractCharacterIdFromUrl(url: string): string | null {
  const result = toyhouseCharacterUrlPattern.exec(url);
  if (!result) return null;
  return result.groups?.id ?? null;
}
