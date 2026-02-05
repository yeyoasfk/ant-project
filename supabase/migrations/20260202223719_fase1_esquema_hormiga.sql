
-- configuracion usuario y perfil. 

create table public.profiles (
    id uuid not null references auth.users on delete cascade primary key,
    email text unique not null, 
    full_name text,
    avatar_url text,
    -- Logica hormiga
    -- el usuario define el limite de gasto hormiga 
    -- gastos inferiores seran hormiga
    ant_expense_threshold numeric(10, 2) default 5000.00,
    -- presupuesto mensual meta
    monthly_budget numeric(15, 2),

    created_at timestamptz default now(),
    update_at timestamptz default now()
);

--conexiones bancarias (fintoc link)
-- representa la conexion segura con una institucion
create table public.bank_connections(
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references public.profiles(id) on delete cascade,
    
    fintoc_link_id text unique not null,        -- token de fintok para refrescar datos
    institution_name text not null,             -- "banco santander", "banco falabella"
    institution_id text,                        -- id interno de fintoc para el banco
    status text default 'active',               -- active, inactive, disconnected

    created_at timestamptz default now()
);

-- cuentas bancarias
-- un banco puede tener muchas cuentas como debito, credito, vista, etc.
create table public.accounts(
    id uuid default gen_random_uuid() primary key,
    connection_id uuid not null references public.bank_connections(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,

    fintoc_account_id text unique not null,
    name text not null,                     --ej: "cuenta corriente"
    official_name text,                     
    type text not  null,                    --checking, credit_card, savings
    holder_type text,                       -- individual, business, etc

    currency text default 'CLP',
    balance_current numeric(15, 2) not null default 0, --es el saldo actual
    balance_limit numeric (15, 2), -- cupo total (para credito)

    created_at timestamptz default now(),
    last_synced_at timestamptz     --para saber cuando se actualizo por ultima vez
);

-- transacciones
create table public.transactions (
    id uuid default gen_random_uuid() primary key,
    account_id uuid not null references public.accounts(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,

    fintoc_transaction_id text unique,   --evita duplicados

    amount numeric(15, 2) not null,      -- si es negativo es gasto, positivo ingreso
    currency text default 'CLP',
    date date not null,

    description text not null,          -- starbuck, uber, netflic
    merchant_name text, 

    --categorizacion
    category text,
    subcategory text,

    -- logica hormiga automatica
    is_hormiga boolean default false, 
    is_manual_entry boolean default false,

    created_at timestamptz default now()
);

--educacion financiera 
-- tabla statica para esneñar terminos
create table public.financial_terms (
    id uuid default gen_random_uuid() primary key,
    term text not null unique,              -- interes compuesto, gasto hormiga
    definition text not null,               -- explicacion sensilla
    category text,                          -- inversion, ahorro, credito
    example text,                           -- ejemplo practico
    created_at timestamptz default now()
);

-- seguridad RLS
alter table public.profiles enable row level security;
alter table public.bank_connections enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.financial_terms enable row level security;

--politicas de lectura
--perfiles
create policy "Usuario ve su propio perfil" on public.profiles for select using (auth.uid()=id);
create policy "Usuario edita su propio perfil" on public.profiles for update using (auth.uid()=id);

--conexiones bancarias
create policy "Usuario ve sus conexiones" on public.bank_connections for select using(auth.uid()=user_id);
create policy "Usuario crea conexiones" on public.bank_connections for insert with check (auth.uid()=user_id);

--cuentas
create policy "Usuario ve sus cuentas" on public.accounts for select using (auth.uid()=user_id);

--transacciones
create policy "Usuario ve sus transacciones" on public.transactions for select using(auth.uid() =user_id);
create policy "Usuario inserta manuales" on public.transactions for insert with check (auth.uid()= user_id);

--glosario (publico para leer, solo admins editan, por ahora solo lectura)
create policy "Todos pueden leer glosario" on public.financial_terms for select to authenticated using (true);


-- trigger automatico de usuario
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles(id, email, full_name, ant_expense_threshold)
    values(new.id, new.email, new.raw_user_meta_data->> 'full_name', 5000.00); --defaul 5000clp
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

