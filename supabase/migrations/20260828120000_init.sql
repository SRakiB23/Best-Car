create extension if not exists pgcrypto;

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  location text not null,
  sort_order int not null default 0
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12, 2) not null check (price >= 0),
  stock int not null default 0,
  created_at timestamptz not null default now()
);

create table public.countries (
  code text primary key,
  name text not null
);

comment on column public.countries.code is 'ISO 3166-1 numeric, matches world-atlas topology ids';

create type public.order_status as enum ('success', 'pending', 'cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  store_id uuid references public.stores (id) on delete set null,
  country_code text references public.countries (code),
  reference text not null,
  payment_method text not null,
  status public.order_status not null default 'success',
  amount numeric(12, 2) not null check (amount >= 0),
  quantity int not null default 1 check (quantity > 0),
  placed_at timestamptz not null default now()
);

create index orders_placed_at_idx on public.orders (placed_at desc);
create index orders_status_placed_at_idx on public.orders (status, placed_at desc);
create index orders_product_idx on public.orders (product_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  detail text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender text not null,
  preview text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  avatar_url text not null default '',
  role text not null default 'Store Administrator',
  updated_at timestamptz not null default now()
);

create table public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  store_name text not null default 'BestCar Motors',
  currency text not null default 'USD' check (currency in ('USD', 'EUR', 'GBP', 'BDT')),
  timezone text not null default 'Asia/Dhaka',
  low_stock_threshold int not null default 5 check (low_stock_threshold > 0),
  locale text not null default 'en' check (locale in ('en', 'bn', 'de')),
  updated_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create function public.sales_trend(window_days int)
returns table (percent numeric, direction text)
language sql
stable
set search_path = ''
as $$
  with current_window as (
    select coalesce(sum(amount), 0) as revenue
    from public.orders
    where status = 'success'
      and placed_at >= now() - make_interval(days => window_days)
  ),
  previous_window as (
    select coalesce(sum(amount), 0) as revenue
    from public.orders
    where status = 'success'
      and placed_at >= now() - make_interval(days => window_days * 2)
      and placed_at < now() - make_interval(days => window_days)
  )
  select
    case
      when previous_window.revenue = 0 then 100
      else round(abs(current_window.revenue - previous_window.revenue) / previous_window.revenue * 100)
    end,
    case when current_window.revenue >= previous_window.revenue then 'up' else 'down' end
  from current_window, previous_window;
$$;

create function public.earning_summary(window_days int)
returns table (
  revenue numeric,
  total_sales bigint,
  purchased_goods bigint,
  percent numeric,
  direction text
)
language sql
stable
set search_path = ''
as $$
  with totals as (
    select
      coalesce(sum(amount), 0) as revenue,
      count(*) as total_sales,
      coalesce(sum(quantity), 0) as purchased_goods
    from public.orders
    where status = 'success'
      and placed_at >= now() - make_interval(days => window_days)
  )
  select totals.revenue, totals.total_sales, totals.purchased_goods, trend.percent, trend.direction
  from totals, public.sales_trend(window_days) as trend;
$$;

create function public.best_sellers(window_days int, max_rows int)
returns table (id uuid, name text, price numeric, sales bigint)
language sql
stable
set search_path = ''
as $$
  select p.id, p.name, p.price, sum(o.quantity)::bigint as sales
  from public.orders o
  join public.products p on p.id = o.product_id
  where o.status = 'success'
    and o.placed_at >= now() - make_interval(days => window_days)
  group by p.id, p.name, p.price
  order by sales desc
  limit max_rows;
$$;

create function public.sales_analytics(target_year int)
returns table (month_label text, total numeric)
language sql
stable
set search_path = ''
as $$
  select
    to_char(period.month, 'Mon') as month_label,
    coalesce(sum(o.amount), 0) as total
  from generate_series(
    make_date(target_year, 1, 1),
    make_date(target_year, 12, 1),
    interval '1 month'
  ) as period (month)
  left join public.orders o
    on o.status = 'success'
    and date_trunc('month', o.placed_at)::date = period.month::date
  group by period.month
  order by period.month;
$$;

create function public.country_sales(window_days int)
returns table (code text, name text, sales bigint)
language sql
stable
set search_path = ''
as $$
  select c.code, c.name, coalesce(sum(o.quantity), 0)::bigint as sales
  from public.countries c
  left join public.orders o
    on o.country_code = c.code
    and o.status = 'success'
    and o.placed_at >= now() - make_interval(days => window_days)
  group by c.code, c.name
  order by sales desc;
$$;

alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.countries enable row level security;
alter table public.orders enable row level security;
alter table public.notifications enable row level security;
alter table public.messages enable row level security;
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;

create policy "dashboard data is readable" on public.stores for select using (true);
create policy "dashboard data is readable" on public.products for select using (true);
create policy "dashboard data is readable" on public.countries for select using (true);
create policy "dashboard data is readable" on public.orders for select using (true);
create policy "dashboard data is readable" on public.notifications for select using (true);
create policy "dashboard data is readable" on public.messages for select using (true);

create policy "own profile is readable" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "own profile is writable" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "own settings are readable" on public.user_settings
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own settings are writable" on public.user_settings
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
