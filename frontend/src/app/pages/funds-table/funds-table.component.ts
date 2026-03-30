import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FundsService, Fund } from '../../services/funds.service';

type SortField = 'name' | 'fundSize' | 'vintage' | 'currency';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-funds-table',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './funds-table.component.html',
  styleUrl: './funds-table.component.scss'
})
export class FundsTableComponent implements OnInit {
  allFunds: (Fund & { index: number })[] = [];
  filteredFunds: (Fund & { index: number })[] = [];
  pagedFunds: (Fund & { index: number })[] = [];
  loading = true;

  searchQuery = '';
  selectedYear: number | null = null;
  availableYears: number[] = [];

  sortField: SortField = 'name';
  sortDir: SortDir = 'asc';

  currentPage = 1;
  pageSize = 15;
  totalPages = 1;

  constructor(private fundsService: FundsService, private router: Router) {}

  ngOnInit() {
    this.fundsService.getAll().subscribe({
      next: (data) => {
        this.allFunds = data.map((f, i) => ({ ...f, index: i }));
        this.availableYears = [...new Set(this.allFunds.map(f => f.vintage))].sort((a, b) => b - a);
        this.applyFilters();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilters() {
    const q = this.searchQuery.toLowerCase().trim();

    let result = this.allFunds.filter(f => {
      const matchesSearch = !q ||
        f.name.toLowerCase().includes(q) ||
        f.strategies.some(s => s.toLowerCase().includes(q)) ||
        f.geographies.some(g => g.toLowerCase().includes(q)) ||
        f.currency.toLowerCase().includes(q) ||
        f.managers.some(m => m.toLowerCase().includes(q));

      const matchesYear = !this.selectedYear || f.vintage === this.selectedYear;

      return matchesSearch && matchesYear;
    });

    result.sort((a, b) => {
      let valA: string | number = a[this.sortField];
      let valB: string | number = b[this.sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return this.sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredFunds = result;
    this.totalPages = Math.ceil(this.filteredFunds.length / this.pageSize);
    this.currentPage = 1;
    this.updatePage();
  }

  setSort(field: SortField) {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(field: SortField): string {
    if (this.sortField !== field) return '↕';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  setYear(year: number | null) {
    this.selectedYear = year;
    this.applyFilters();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedYear = null;
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!this.searchQuery || !!this.selectedYear;
  }

  updatePage() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedFunds = this.filteredFunds.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePage();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToDetail(index: number) { this.router.navigate(['/funds', index, 'detail']); }
  goToEdit(index: number) { this.router.navigate(['/funds', index, 'edit']); }

  formatSize(size: number): string {
    if (size >= 1000) return (size / 1000).toFixed(2) + 'B';
    return size.toFixed(2) + 'M';
  }
}