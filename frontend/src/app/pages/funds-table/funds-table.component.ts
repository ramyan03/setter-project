import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FundsService, Fund } from '../../services/funds.service';

// Union types restrict sortField and sortDir to only these exact string values
// TypeScript throws an error if you try to assign anything else — catches typos at compile time
type SortField = 'name' | 'fundSize' | 'vintage' | 'currency';
type SortDir = 'asc' | 'desc';

// standalone: true — Angular 17+ feature, no NgModule needed
// imports — every directive and pipe used in the template must be declared here
// CommonModule provides *ngIf and *ngFor
// RouterModule provides routerLink
// FormsModule provides [(ngModel)] for two-way binding
@Component({
  selector: 'app-funds-table',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './funds-table.component.html',
  styleUrl: './funds-table.component.scss'
})
export class FundsTableComponent implements OnInit {

  // THREE SEPARATE ARRAYS — each has a distinct purpose:
  // allFunds — raw data from the API, never mutated after load, single source of truth
  // filteredFunds — result of search + year filter + sort applied to allFunds
  // pagedFunds — current page slice of filteredFunds, what the table actually renders
  // Keeping them separate means filtering never destroys original data
  // Clearing a filter instantly restores everything without a new API call
  // Fund & { index: number } — intersection type, every item must have all Fund fields AND an index
  allFunds: (Fund & { index: number })[] = [];
  filteredFunds: (Fund & { index: number })[] = [];
  pagedFunds: (Fund & { index: number })[] = [];
  loading = true; // controls skeleton loader visibility

  searchQuery = '';                   // bound to search input via [(ngModel)]
  selectedYear: number | null = null; // null means no year selected (show all)
  availableYears: number[] = [];      // unique vintage years for the filter pills

  sortField: SortField = 'name';  // which column is currently sorted
  sortDir: SortDir = 'asc';       // ascending or descending

  currentPage = 1;
  pageSize = 15;   // 100 rows is too many to show at once — 15 per page is readable
  totalPages = 1;

  // Angular injects FundsService and Router via the constructor
  constructor(private fundsService: FundsService, private router: Router) {}

  // ngOnInit — lifecycle hook that runs once after Angular fully initializes the component
  // API calls belong here, not in the constructor — component is fully set up by this point
  ngOnInit() {
    this.fundsService.getAll().subscribe({
      next: (data) => {
        // Add array index to each fund — the JSON file has no ID field
        // The array position IS the identifier used for navigation and API calls
        this.allFunds = data.map((f, i) => ({ ...f, index: i }));

        // Build year filter pills — new Set() removes duplicate vintage years
        // Spread into array, sort descending so newest year appears first
        this.availableYears = [...new Set(this.allFunds.map(f => f.vintage))].sort((a, b) => b - a);

        // Apply default sort (name ascending) before first render
        this.applyFilters();
        this.loading = false;
      },
      // At minimum stop the spinner so user is not stuck on infinite loading state
      error: () => this.loading = false
    });
  }

  // Central filter/sort/paginate function — called any time search, year, or sort changes
  // Always operates on allFunds so original data is never lost
  applyFilters() {
    const q = this.searchQuery.toLowerCase().trim(); // normalize for case-insensitive matching

    let result = this.allFunds.filter(f => {
      // !q short-circuits — if search is empty, every fund passes the search check
      // .some() on arrays — returns true if at least one element matches the query
      const matchesSearch = !q ||
        f.name.toLowerCase().includes(q) ||
        f.strategies.some(s => s.toLowerCase().includes(q)) ||
        f.geographies.some(g => g.toLowerCase().includes(q)) ||
        f.currency.toLowerCase().includes(q) ||
        f.managers.some(m => m.toLowerCase().includes(q));

      // !this.selectedYear — if no year pill is active, every fund passes the year check
      const matchesYear = !this.selectedYear || f.vintage === this.selectedYear;

      // Fund must pass BOTH filters to be included
      return matchesSearch && matchesYear;
    });

    // Sort the filtered result
    result.sort((a, b) => {
      // Access the sort field dynamically — sortField is typed as SortField
      // so TypeScript knows it is a valid key of Fund
      let valA: string | number = a[this.sortField];
      let valB: string | number = b[this.sortField];

      // Lowercase strings for case-insensitive sort — "Zebra" would sort after "apple" without this
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      // Array.sort comparison contract: return -1, 0, or 1
      // Flip the sign based on sortDir to handle both asc and desc with the same logic
      if (valA < valB) return this.sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDir === 'asc' ? 1 : -1;
      return 0; // equal — maintain original order
    });

    this.filteredFunds = result;

    // Math.ceil rounds up — 16 results / 15 per page = 1.06... = 2 pages
    this.totalPages = Math.ceil(this.filteredFunds.length / this.pageSize);

    // Always reset to page 1 when filters change
    // If on page 5 and filter returns 8 results, page 5 no longer exists
    this.currentPage = 1;
    this.updatePage();
  }

  // Handles column header clicks — toggles direction or switches column
  setSort(field: SortField) {
    if (this.sortField === field) {
      // Same column clicked — toggle direction asc → desc → asc
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      // Different column — switch to it and reset to ascending
      this.sortField = field;
      this.sortDir = 'asc';
    }
    this.applyFilters(); // re-sort and re-paginate
  }

  // Returns the sort direction arrow shown in the column header
  // ↕ on inactive columns, ↑ or ↓ on the active sorted column
  getSortIcon(field: SortField): string {
    if (this.sortField !== field) return '↕';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  // Called when a year pill is clicked — null means "All" (clear year filter)
  setYear(year: number | null) {
    this.selectedYear = year;
    this.applyFilters();
  }

  // Clears both search and year filter — resets table to full unfiltered view
  clearFilters() {
    this.searchQuery = '';
    this.selectedYear = null;
    this.applyFilters();
  }

  // Getter — used in template to show/hide the "Clear all filters" button
  // !! converts to boolean — null and empty string are both falsy
  get hasActiveFilters(): boolean {
    return !!this.searchQuery || !!this.selectedYear;
  }

  // Slices filteredFunds for the current page
  // Page 1: slice(0, 15)   Page 2: slice(15, 30)   Page 3: slice(30, 45)
  // slice() never mutates — returns a new array
  updatePage() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedFunds = this.filteredFunds.slice(start, start + this.pageSize);
  }

  // Handles pagination button clicks — guards against out-of-range page numbers
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePage();
  }

  // Getter — returns array of page numbers to display in pagination
  // Shows up to 5 pages centered around current page
  // Math.max prevents going below 1, Math.min prevents going above totalPages
  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // Navigation methods — called from template on click events
  goToDetail(index: number) { this.router.navigate(['/funds', index, 'detail']); }
  goToEdit(index: number) { this.router.navigate(['/funds', index, 'edit']); }

  // Formats raw fund size number into readable string
  // 4867.88 → "4.87B"   798.71 → "798.71M"
  formatSize(size: number): string {
    if (size >= 1000) return (size / 1000).toFixed(2) + 'B';
    return size.toFixed(2) + 'M';
  }
}