-- A handful of inquiries so the qualification screen has something to work on.
-- They vary deliberately: one detailed, one vague, one urgent corporate request
-- and one that is barely a lead at all, which is where the model earns its keep.
insert into public.leads (customer_name, customer_email, customer_phone, message, source, vehicle_id)
values
  (
    'Nadia Rahman',
    'nadia.rahman@example.com',
    '+8801711223344',
    'Hi, we are a family of five flying in on the 12th of next month and need an automatic SUV for eight days. Budget is around $180 a day and we have three large suitcases. Can you confirm availability?',
    'website',
    (select id from public.products order by created_at limit 1)
  ),
  (
    'Tom Whitfield',
    'tom.whitfield@example.com',
    '',
    'Do you have anything cheap available this weekend? Just need to get around the city.',
    'website',
    null
  ),
  (
    'Priya Desai',
    'priya.desai@example.com',
    '+442071234567',
    'Our company needs three executive sedans from Monday for a three month project. We have a corporate account with another provider but their service has been poor. Please call me today, we need to sign something this week.',
    'website',
    null
  ),
  (
    'Alex Moreau',
    'alex.moreau@example.com',
    '',
    'Just wondering what kind of cars you have in your fleet. Not sure when I will travel yet.',
    'website',
    null
  );
