import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  format?: 'currency' | 'percentage' | 'number';
  loading?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  trend,
  icon: Icon = DollarSign,
  variant = 'default',
  format = 'number',
  loading = false,
  className,
}: StatsCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);

      case 'percentage':
        return `${val.toFixed(1)}%`;

      default:
        return val.toLocaleString('es-CO');
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;

    if (trend.value === 0) {
      return <Minus className='h-3 w-3' />;
    }

    return trend.isPositive ? (
      <ArrowUpRight className='h-3 w-3' />
    ) : (
      <ArrowDownRight className='h-3 w-3' />
    );
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          icon: 'text-green-600',
          trend: trend?.isPositive
            ? 'text-green-600 bg-green-50'
            : 'text-red-600 bg-red-50',
          card: 'border-green-200',
        };
      case 'warning':
        return {
          icon: 'text-yellow-600',
          trend: trend?.isPositive
            ? 'text-green-600 bg-green-50'
            : 'text-red-600 bg-red-50',
          card: 'border-yellow-200',
        };
      case 'destructive':
        return {
          icon: 'text-red-600',
          trend: trend?.isPositive
            ? 'text-green-600 bg-green-50'
            : 'text-red-600 bg-red-50',
          card: 'border-red-200',
        };
      default:
        return {
          icon: 'text-primary',
          trend: trend?.isPositive
            ? 'text-green-600 bg-green-50'
            : 'text-red-600 bg-red-50',
          card: '',
        };
    }
  };

  const styles = getVariantStyles();

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <div className='h-4 w-24 bg-muted rounded' />
          <div className='h-4 w-4 bg-muted rounded' />
        </CardHeader>
        <CardContent>
          <div className='h-8 w-32 bg-muted rounded mb-2' />
          <div className='h-3 w-20 bg-muted rounded' />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(styles.card, className)}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {title}
        </CardTitle>
        <Icon className={cn('h-4 w-4', styles.icon)} />
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{formatValue(value)}</div>

        <div className='flex items-center justify-between mt-2'>
          {description && (
            <p className='text-xs text-muted-foreground flex-1'>
              {description}
            </p>
          )}

          {trend && (
            <div
              className={cn(
                'flex items-center rounded-full px-2 py-1 text-xs font-medium',
                styles.trend
              )}
            >
              {getTrendIcon()}
              <span className='ml-1'>
                {Math.abs(trend.value)}%{trend.period && ` ${trend.period}`}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Mostrar tarjetas en grilla
export interface StatsGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({
  children,
  columns = 4,
  className,
}: StatsGridProps) {
  const getGridCols = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    }
  };

  return (
    <div className={cn('grid gap-4', getGridCols(), className)}>{children}</div>
  );
}

// Tarjeta de estadísticas financieras
export function FinancialStatsCard({
  type,
  amount,
  trend,
  period = 'este mes',
  loading = false,
}: {
  type: 'income' | 'expense' | 'balance' | 'transactions';
  amount: number;
  trend?: { value: number; isPositive: boolean };
  period?: string;
  loading?: boolean;
}) {
  const configs = {
    income: {
      title: 'Ingresos Totales',
      icon: TrendingUp,
      variant: 'success' as const,
      format: 'currency' as const,
      description: `Ingresos ${period}`,
    },
    expense: {
      title: 'Egresos Totales',
      icon: TrendingDown,
      variant: 'destructive' as const,
      format: 'currency' as const,
      description: `Egresos ${period}`,
    },
    balance: {
      title: 'Balance',
      icon: DollarSign,
      variant: amount >= 0 ? ('success' as const) : ('destructive' as const),
      format: 'currency' as const,
      description: `Balance ${period}`,
    },
    transactions: {
      title: 'Transacciones',
      icon: ArrowUpRight,
      variant: 'default' as const,
      format: 'number' as const,
      description: `Movimientos ${period}`,
    },
  };

  const config = configs[type];

  return (
    <StatsCard
      title={config.title}
      value={amount}
      description={config.description}
      trend={trend}
      icon={config.icon}
      variant={config.variant}
      format={config.format}
      loading={loading}
    />
  );
}
