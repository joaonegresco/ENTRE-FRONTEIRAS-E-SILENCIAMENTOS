// Os períodos, a cobertura geográfica e as unidades pertencem a cada publicação.
// Cada linha é uma observação independente, inclusive quando o país se repete.
{
  const gaza = 'https://chile.unwomen.org/en/articles/in-focus/gaza';
  const alert = 'https://chile.unwomen.org/sites/default/files/2026-04/gender-alert-the-immediate-and-long-term-impact-of-the-military-escalation-in-the-middle-east-on-women-and-girls-en.pdf';
  const lebanon = 'https://dppa.un.org/sites/default/files/2026-06/OCHA_Lebanon_Flash_Update%20No%2027.pdf';
  const records = [];
  function add(country, area, topic, value, date, note, source, url) {
    records.push({ country, area, topic, value, date, note, source, url });
  }

  add('GAZ', 'Faixa de Gaza', 'deaths', '> 38 mil', 'out. 2023 – 9 out. 2026',
    'Estimativa de mulheres e meninas mortas desde o início da guerra em Gaza.', 'ONU Mulheres', gaza);
  add('GAZ', 'Faixa de Gaza', 'injuries', '≈ 11.700', 'out. 2023 – 9 out. 2026',
    'Mulheres e meninas com ferimentos que resultaram em deficiência permanente. O levantamento cobre apenas esse subconjunto das lesões graves.', 'ONU Mulheres', gaza);
  add('PSE', 'Gaza e Cisjordânia', 'sexual', '8', 'verificação em 2025',
    'Sete mulheres e uma menina originárias de Gaza e da Cisjordânia. A ONU verificou os registros em 2025. As ocorrências do conjunto investigado abrangem 2023 a 2025. O relatório descreve ameaças e agressões físicas, sem repartir essas oito sobreviventes por modalidade ou território.', 'ONU · S/2026/321, § 35',
    'https://www.un.org/unispal/wp-content/uploads/2026/04/secretary-general-2026report-on-sexual-violence-in-conflict.pdf');
  add('GAZ', 'Faixa de Gaza', 'displacement', 'Quase 1 milhão', 'out. 2023 – 9 out. 2026',
    'Mulheres e meninas deslocadas durante a guerra em Gaza, segundo estimativa da ONU Mulheres.', 'ONU Mulheres', gaza);
  add('IRN', 'Irã', 'deaths', '496', '28 fev. – 6 abr. 2026',
    'Mulheres entre as mortes civis comunicadas pela Organização de Medicina Legal do Irã à OMS.', 'OMS · informe regional de 2 jun. 2026',
    'https://www.emro.who.int/images/stories/eha/ME-Sitrep-15-2-June-26.pdf');
  add('IRN', 'Irã', 'injuries', '4.721', '28 fev. – 5 abr. 2026',
    'Mulheres feridas no balanço nacional do Ministério da Saúde iraniano divulgado pela WANA. A publicação agrega as gravidades.', 'Ministério da Saúde do Irã via WANA',
    'https://wanaen.com/iran-health-ministry-releases-latest-casualty-and-damage-figures/');
  add('IRN', 'Irã', 'displacement', '≈ 1,6 milhão', 'mar. 2026',
    'Estimativa de mulheres e meninas deslocadas dentro do país, publicada em abril pela ONU Mulheres com referência ao informe regional do ACNUR de 29 de março.', 'ONU Mulheres · Gender Alert, p. 3', alert);
  add('LBN', 'Líbano', 'deaths', '279', '2 mar. – 18 maio 2026',
    'Mulheres mortas segundo o Ministério da Saúde Pública. O boletim registra crianças em categoria própria.', 'OCHA Líbano · boletim 27', lebanon);
  add('LBN', 'Líbano', 'injuries', '1.124', '2 mar. – 18 maio 2026',
    'Mulheres feridas segundo o Ministério da Saúde Pública. A publicação agrega as gravidades e registra crianças em categoria própria.', 'OCHA Líbano · boletim 27', lebanon);
  add('LBN', 'Líbano', 'displacement', '≈ 620 mil', 'mar. 2026',
    'Estimativa de mulheres e meninas deslocadas dentro do Líbano, citada na análise de gênero da ONU Mulheres.', 'ONU Mulheres · Gender Alert, p. 3', alert);
  add('BHR', 'Bahrein', 'deaths', '1', '9–10 mar. 2026',
    'Uma mulher bareinita morta nos ataques descritos pelo governo em carta ao Conselho de Segurança. A contagem se limita aos episódios citados.', 'Governo do Bahrein · carta S/2026/244',
    'https://digitallibrary.un.org/record/4107520/files/S_2026_244-EN.pdf');
  add('KWT', 'Norte do Kuwait', 'injuries', '≥ 2', '6 abr. 2026',
    'Duas mulheres receberam atendimento no local em um episódio com seis feridos. O comunicado informa que todas as pessoas estavam estáveis e só identifica o sexo dessas duas.', 'Ministério da Saúde do Kuwait via Kuwait Times',
    'https://kuwaittimes.com/article/41974/kuwait/other-news/frontliners-at-the-forefront/');
  add('ARE', 'Abu Dhabi', 'injuries', '1', '1 mar. 2026',
    'Uma mulher ferida no incidente das Etihad Towers, segundo a comunicação oficial dos Emirados à ONU. O registro corresponde a esse incidente.', 'Emirados Árabes Unidos · Assembleia Geral da ONU',
    'https://static.un.org/en/ga/sixth/81/protection_of_diplomats/uae_e.pdf');
  add('ISR', 'Sul de Israel', 'sexual', 'Documentada', '7 out. 2023',
    'A missão da ONU encontrou motivos razoáveis para concluir que houve violência sexual durante os ataques em vários locais. A missão não determinou o total de vítimas.', 'ONU · missão sobre violência sexual em conflitos',
    'https://www.un.org/sexualviolenceinconflict/press-release/israel-west-bank-mission/');
  add('IRQ', 'Iraque', 'deaths', 'Documentada', 'fev. – abr. 2026',
    'A ONU Mulheres cita mortes de mulheres ou meninas no Iraque na escalada regional. O relatório não fornece um número nacional feminino.', 'ONU Mulheres · Gender Alert, p. 2', alert);
  window.records = records;
}
