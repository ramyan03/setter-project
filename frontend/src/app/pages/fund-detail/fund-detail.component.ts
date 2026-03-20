import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FundsService, Fund } from '../../services/funds.service';

@Component({
  selector: 'app-fund-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fund-detail.component.html',
  styleUrl: './fund-detail.component.scss',
})
export class FundDetailComponent implements OnInit {
  fund?: Fund;
  index!: number;
  loading = true;

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
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  formatSize(size: number): string {
    if (size >= 1000) return (size / 1000).toFixed(2) + 'B';
    return size.toFixed(2) + 'M';
  }

  goBack() {
    this.router.navigate(['/funds']);
  }
  goToEdit() {
    this.router.navigate(['/funds', this.index, 'edit']);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
