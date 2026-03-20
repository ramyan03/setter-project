import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FundsService, Fund } from '../../services/funds.service';

@Component({
  selector: 'app-fund-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fund-edit.component.html',
  styleUrl: './fund-edit.component.scss',
})
export class FundEditComponent implements OnInit {
  fund?: Fund;
  index!: number;
  loading = true;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error' = 'idle';
  showDeleteConfirm = false;

  // Editable string versions of arrays
  strategiesStr = '';
  geographiesStr = '';
  managersStr = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fundsService: FundsService,
  ) {}

  ngOnInit() {
    this.index = Number(this.route.snapshot.paramMap.get('index'));
    this.fundsService.getOne(this.index).subscribe({
      next: (data) => {
        this.fund = data;
        this.strategiesStr = data.strategies.join(', ');
        this.geographiesStr = data.geographies.join(', ');
        this.managersStr = data.managers.join(', ');
        this.loading = false;
      },
    });
  }

  autoSave() {
    if (!this.fund) return;
    this.saveStatus = 'saving';
    const payload = {
      ...this.fund,
      strategies: this.strategiesStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      geographies: this.geographiesStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      managers: this.managersStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };
    this.fundsService.update(this.index, payload).subscribe({
      next: () => {
        this.saveStatus = 'saved';
        setTimeout(() => (this.saveStatus = 'idle'), 2000);
      },
      error: () => (this.saveStatus = 'error'),
    });
  }

  confirmDelete() {
    this.showDeleteConfirm = true;
  }
  cancelDelete() {
    this.showDeleteConfirm = false;
  }

  deleteFund() {
    this.fundsService.delete(this.index).subscribe({
      next: () => this.router.navigate(['/funds']),
    });
  }

  goBack() {
    this.router.navigate(['/funds', this.index, 'detail']);
  }
}
