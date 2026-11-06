/* Paynesville Entertainment Awards 2026/2027 — official categories & nominees.
   Transcribed from the organizers' category posters (Google Drive folder "PEA Final").
   Organizers can correct spellings, add photos and bios in the Admin Dashboard. */
const PEA_POSTER = id => `https://lh3.googleusercontent.com/d/${id}=w1200`;

const PEA_CATEGORY_LIST = [
  ['artist', 'Artist of the Year', '🌟', '1DEaEz69QvnopbzwRpOKMFbsADL2HyOCf', ['King Dennis', 'Brickson', 'Christoph the Change', 'SIO', 'Bucky Raw']],
  ['male-artist', 'Best Male Artist of the Year', '🎤', '1Q_b4lqrUXsMfyTE1xvnbl6vOp9zFsB8V', ['Jboy de Prophet', 'Bucky Raw', 'Christoph the Change', 'Brickson', 'King Dennis']],
  ['female-artist', 'Best Female Artist of the Year', '👑', '1VOlTd88PabSPWqnxWG0MrCc9LKAhYfAC', ['Faithvonic of Africa', 'PILLZ', 'MC Caro', 'Fluxii', 'Anitram']],
  ['new-artist', 'Best New Artist of the Year', '✨', '1ciy8GW-2W2Dar95b4ihKndGnzA2k8wcE', ['Michano', 'L-Money de Vibe Maker', 'Melodi', 'Rafield G', 'E Wise Dbanga', 'Royal P', 'Diamonnatro Official']],
  ['watch-out', 'Artist to Watch Out For', '👀', '1bzHJOqL1diOOSse3lrTKBQfq8mE8DMi0', ['TeddyK TeddyK', 'Beat Killer', 'RapTwin Music', 'Quin Lee', 'Bonah Lay', 'Ruthline McCauley', 'Jaywuo', 'Fe So']],
  ['future-artist', 'Future Artist of the Year', '🚀', '1tJTE6a8nbYY5C2pP4DYVMCfQ6CyDsG7_', ['M.Tonnie', 'Tumba Baby', 'Quin Lee', 'King Billine']],
  ['hipco', 'Hipco / Trapco Artist of the Year', '🔥', '15uoapTyP-dGz572iooI8BiHqR9mGU4s6', ['King Dennis', 'Bucky Raw', 'Adallie C.R.G', 'International A.D King', 'Christoph the Change']],
  ['gospel', 'Best Gospel Artist of the Year', '🙏', '1mTJXYJgSD6wa-clPMpiso_CXbBaRj-xc', ['Pst. Joseph K. Akofie', 'Victor Jones', 'Alexander V. Higgins', 'Paul Kennie Harding', 'Min. Josephine F. Kennie', 'Min. Watson']],
  ['traditional', 'Best Traditional Artist of the Year', '🥁', '1lyOv7yIDjk6DO5XiV9-6bvpA2ims9f-F', ['Mark De Fireman', 'Krahn Bio Leowin', 'De Rapper Dinsea']],
  ['diaspora', 'Diaspora Artist of the Year', '🌍', '1nw_c901Lggg_0CKgrNcVDzH3u0utcEst', ['Taweh G', 'Victor Jones', 'Theo De Franco', 'AK Feeling Man', 'Dee NiceB']],
  ['song', 'Song of the Year', '🎵', '1hZIonzL3RFnM2ENjm31dlPB1gkibFSv0', ['Christoph the Change – Kor-Kor Zee Kor', 'Bucky Raw – Baddie', 'Christoph the Change – Inside Music', 'Brickson x King Dennis x Nuchie Meek – My Love', 'SIO – Nobody Ugly']],
  ['collaboration', 'Collaboration of the Year', '🤝', '1RT4dUbonc4KIzK4jM4iSoUsqhqpFHt5z', ['Dee NiceB ft Royal P', 'Melodi ft Spize', 'King Dennis ft Rafield G', 'Royal P ft King Dennis', 'Rafield G ft Christoph', 'Brickson ft King Dennis x Nuchie Meek']],
  ['producer', 'Producer of the Year', '🎛️', '1-Odx5dvEIV_Z2gYZXmQsv9UlLNIonXeu', ['Dopest Sound', 'LiL SKU', 'King 2G BeaZZ', 'AFO4DOE', 'ShinaBeatz', 'ShadowBeat']],
  ['video-director', 'Video Director of the Year', '📹', '18oQumYBk3S3H-DFzvm4HCOOD2FNutoic', ['Sayou Tequah Jr.', 'Marv Visuals', "Smart Ander's", 'Lolly OX', 'Korto Davis']],
  ['club-dj', 'Best Club DJ / Event DJ of the Year', '🎧', '14rIuufXesNLb6gjRnb70aNKGHq_7KZpR', ['DJ Red', 'DJ Same', 'DJ Z', 'DJ Killer', 'Young DJ Major', 'DJ Faithful']],
  ['radio-dj', 'Radio DJ & Promoter of the Year', '📻', '1VsjHyLB_MEu0XK823VMZ2_43jsnpWwsH', ['Civilized Mano-Boi', 'DJ Aaronic', 'DJ Cash', 'DJ Kasnow Zoegar', 'DJ Eco', 'DJ Rotten', 'DJ Magic']],
  ['radio-personality', 'Radio Personality of the Year', '🎙️', '19XUARmPwHBbweOz58T953YVQTKtaUU_J', ['Weekie Brooks', 'Boakai Amara Kamara', 'Constance Joetta', 'DJ Aaronic', 'DJ Eco']],
  ['radio-station', 'Best Radio Station of the Year', '📡', '1OIDSSrc72mwZC_QY0_GILr45ATxwQQ07', ['ELBC', 'Blaze FM', 'Punch FM', 'Global Dream FM Radio', 'OK FM', 'Truth FM']],
  ['mc', 'Best MC of the Year', '🎤', '1brgVxMjQvqIjCITYZeK42wPVkrScl9Nu', ['DJ Aaronic', 'JW Bigpapa', 'Ezy Pain', 'Mongar']],
  ['hypeman', 'Hype Man of the Year', '📣', '1NaO0dzIxtvWgO6DFUjq0psn4woNhiIij', ['TheGoat of Hypesoundz', 'Rozaki Rozaki', 'Hypeman Fire Boy the Biggest', 'Hypeman Bucky']],
  ['actor', 'Best Actor of the Year', '🎬', '1jO5_-zRPASlV8UDIwpjcOPhO-XhDWdOA', ['Joseph C. Weah Jr.', 'Sakou M. Sirleaf', 'Terry Brown', 'Sammie Jaylah', 'Frank O. Wakie', 'Ralfee Usman Lor', 'Amb. Clarence B. Waner']],
  ['actress', 'Best Actress of the Year', '🎭', '1PhOCiABrzXjvkiA04DKt-CTe90O2Iu0V', ['Ertamar Thomson', 'Catherine Page', 'D. Babara Gono', 'LIB Sarafina', 'Sampdoria Grace', 'Lydia G. Vonlah']],
  ['comedian', 'Comedian of the Year', '😂', '1GAXYWo--8leXGj-7Y77M9lWK-xkiJd06', ['Big Woman Royalty', 'Clarence Skits', 'Sagacious Comedy', 'Mongar Comedy', 'Real Paul Flomo', 'Comedian Pa Joe']],
  ['dance', 'Best Dance Crew / Dancer of the Year', '💃', '1aTRk1I4BY2x3h6bazK9URKKhwN3T-s0N', ['Face of Liberia Dance Crew', 'LIB Fantastic Force', 'Dance Mitch', 'Diamonnatro Official', 'Dancer Rollie Official']],
  ['content-creator', 'Content Creator of the Year', '📸', '1yuANJHcXr7UV37sMTvdvD9udn69UflXV', ['DC & Billina', 'Supreme DaOe', 'Jeff Myers', 'Ma Lorpu', 'A Classic', 'Tango D Badguy', 'Anthel', 'Officer Tuso', 'Jah Bless']],
  ['social-influencer', 'Social Media Influencer of the Year', '📱', '1xKWhq_dvMUpEBJEMDkG1BWh0RBLrnUAR', ['DJ Aaronic Official', 'Tango D Badguy', 'A Classic', 'King Billine', 'Royal Beauty', 'Sha Lyn', 'Cyntara Eyes of the Gods', 'Fullah Queen']],
  ['tiktok', 'Best Female TikTok Influencer of the Year', '🎶', '1pSKB5PmFSyqKCuzz4N6Pvm846vVRcReL', ['Royal Beauty', 'Barbie P. Ben', 'Energy Tra-Tra', 'King Billine', 'Sha Lyn', 'Cyntara Eyes of the Gods', 'Fullah Queen']],
  ['intl-influencer', 'Social Media Influencer of the Year (International)', '✈️', '1AQCLJCMlzNEJU-fCxLk_RybLfJWnFAeM', ['Karisma (Drama Doll)', 'StarPower Cece Maintain', 'Charlotte Roberts', 'Sosome Chesson']],
  ['blog', 'Blog of the Year', '📰', '1p1PHVR3JCeH65ICftg19aenu5bDhcwdn', ['Mark the Blogger', 'Gary the Blogger', 'Gossip Liberia', 'Rocky Online', 'JW Bigpapa Media', 'Francis the Blogger 231', 'Liberian Soccer', 'Stress Free Blog']],
  ['fashion', 'Fashion Designer of the Year', '👗', '1imNf4tov2clzDa-xHoxCM7HPr0JXe1VI', ['Designer Tyga', 'Cwise the Boss', 'Ma Kpana Son (Kelvin)', 'Godwin Godwin', 'Phyno the Boss']],
  ['graphics', 'Best Graphics Designer of the Year', '🎨', '1oSYVVywQLLgmWCqYzLOl7oGow2lGp8Zh', ['KN Graphic', 'Dr Speen Design', 'Elvis Work', 'Areece Graphic']],
  ['photo', 'Best Photo Studio / Photographer of the Year', '📷', '1GCoRAL6-1P6wVnG2CDPy1tzARkChFu2u', ['Master Pop-Pop Studio', 'SupremeDada – Jas Studio', 'Shine-Shine Studio', 'King Flash']],
  ['beauty', 'Beautician / Beauty Salon of the Year', '💄', '1ybruf4duhlpRllhcb07TbUHnDb2v5mwO', ["Mikey's Touch", 'Charles Glow', 'Leona Beauty Bar']],
  ['nightclub', 'Most Trending Bar / Night Club of the Year', '🍸', '1OlvIY7h52JZEZyZhU7i86hLwmpqawPeS', ['Seny Bar', 'New Liberia', 'Private Bar', 'Passion Night Club']]
];

const PEA_DEFAULT = {
  settings: {
    pricePerVote: 0.25,
    currency: 'USD',
    votingOpen: true,
    season: '2026/2027',
    eventDate: '2027-01-30T19:00:00',
    eventVenue: 'Paynesville, Montserrado County, Liberia',
    sponsorPhone: '+231 886 629 824',
    social: '@pea'
  },
  categories: PEA_CATEGORY_LIST.map(([id, name, icon, poster]) => ({ id, name, icon, poster: PEA_POSTER(poster), desc: '' })),
  nominees: PEA_CATEGORY_LIST.flatMap(([cid, cname, , , list]) =>
    list.map((name, i) => ({ id: `${cid}-${i + 1}`, categoryId: cid, name, bio: '', photo: '' })))
};
