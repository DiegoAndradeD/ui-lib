import { SmartSelectConfig, Option } from "../../../types";

export class SmartSelectCore {
  private config: SmartSelectConfig;
  private container: HTMLElement;

  private trigger: HTMLElement;
  private valueDisplay: HTMLElement;
  private dropdown: HTMLElement;
  private searchInput: HTMLInputElement;
  private list: HTMLElement;
  private sentinel: HTMLElement;

  private isOpen = false;
  private currentPage = 1;
  private currentSearch = "";
  private hasNextPage = true;
  private isLoading = false;
  private debounceTimer: number | null = null;
  private observer: IntersectionObserver | null = null;

  private handleDocumentClick = (e: MouseEvent) => {
    if (!this.container.contains(e.target as Node)) this.closeDropdown();
  };

  private handleTriggerClick = () => {
    this.toggleDropdown();
  };

  private handleInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = window.setTimeout(() => {
      this.currentSearch = value;
      this.resetAndFetch();
    }, this.config.debounceTime);
  };

  constructor(config: SmartSelectConfig) {
    this.config = { debounceTime: 300, ...config };
    this.container = config.element;

    this.trigger = this.container.querySelector("[data-select-trigger]")!;
    this.valueDisplay = this.container.querySelector("[data-select-value]")!;
    this.dropdown = this.container.querySelector("[data-select-dropdown]")!;
    this.searchInput = this.container.querySelector("[data-select-search]")!;
    this.list = this.container.querySelector("[data-select-list]")!;

    this.sentinel = document.createElement("li");
    this.sentinel.className = "h-1 w-full shrink-0 opacity-0";

    this.initEvents();
    this.initObserver();
  }

  private initEvents() {
    this.trigger.addEventListener("click", this.handleTriggerClick);
    document.addEventListener("mousedown", this.handleDocumentClick);
    this.searchInput.addEventListener("input", this.handleInput);
  }

  private initObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && this.hasNextPage && !this.isLoading) {
          this.fetchData();
        }
      },
      { root: this.list, threshold: 0.1 },
    );

    this.observer.observe(this.sentinel);
  }

  private toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.dropdown.classList.remove("hidden");
      this.searchInput.focus();
      if (this.list.children.length <= 1) this.fetchData();
    } else {
      this.dropdown.classList.add("hidden");
    }
  }

  private closeDropdown() {
    this.isOpen = false;
    this.dropdown.classList.add("hidden");
  }

  private async resetAndFetch() {
    this.currentPage = 1;
    this.hasNextPage = true;
    this.list.innerHTML = "";
    await this.fetchData();
  }

  private async fetchData() {
    if (this.isLoading || !this.hasNextPage) return;

    this.isLoading = true;
    this.renderLoading(true);

    try {
      const result = await this.config.fetchFn(
        this.currentSearch,
        this.currentPage,
      );
      this.renderOptions(result.values);

      this.hasNextPage = this.currentPage < result.metadata.totalPages;
      if (this.hasNextPage) this.currentPage++;
    } catch (error) {
      console.error("Erro ao buscar opções:", error);
    } finally {
      this.isLoading = false;
      this.renderLoading(false);
    }
  }

  private renderOptions(options: Option[]) {
    if (options.length === 0 && this.currentPage === 1) {
      const emptyLi = document.createElement("li");
      emptyLi.className = "px-2 py-2 text-sm text-muted-foreground text-center";
      emptyLi.textContent = "No options found.";
      this.list.appendChild(emptyLi);
      return;
    }

    options.forEach((opt) => {
      const li = document.createElement("li");
      li.className =
        "cursor-pointer rounded-md px-2 py-1.5 text-sm hover:bg-muted text-foreground transition-colors";
      li.textContent = opt.label;

      li.addEventListener("click", () => {
        this.valueDisplay.textContent = opt.label;
        if (this.config.onChange) this.config.onChange(opt);
        this.closeDropdown();
      });

      this.list.appendChild(li);
    });

    this.list.appendChild(this.sentinel);
  }

  private renderLoading(show: boolean) {
    const existingLoader = this.list.querySelector("[data-loading-indicator]");
    if (existingLoader) existingLoader.remove();

    if (show) {
      const loader = document.createElement("li");
      loader.setAttribute("data-loading-indicator", "true");
      loader.className = "px-2 py-2 text-sm text-muted-foreground text-center";
      loader.textContent = "Loading...";
      this.list.appendChild(loader);
      this.list.appendChild(this.sentinel);
    }
  }

  public destroy() {
    this.trigger.removeEventListener("click", this.handleTriggerClick);
    document.removeEventListener("mousedown", this.handleDocumentClick);
    this.searchInput.removeEventListener("input", this.handleInput);
    if (this.observer) this.observer.disconnect();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.list.innerHTML = "";
  }
}
