import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectShops } from '../redux/slices/shopSlice'
import ShopItem from '../components/ShopItem'

const Shops = () => {
    const shops = useSelector(selectShops)
    const [showFilter, setShowFilter] = useState(false);
    const [category, setCategory] = useState([]);
    const [filteredShops, setFilteredShops] = useState([]);
    
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [selectedCities, setSelectedCities] = useState([]);
    const [selectedDistricts, setSelectedDistricts] = useState([]);

    const toggleCategory = (e) => {
        if(category.includes(e.target.value)){
            // Eğer bu kategori zaten seçiliyse 
            // category array'i içinde e.target.value var mı kontrol ediyoruz
            setCategory(prev => prev.filter(item => item !== e.target.value))
            //Kategoriyi listeden çıkarıyoruz
            // prev: mevcut category state'i
            //filter: sadece e.target.value'dan FARKLI olanları al
        }
        else{
            setCategory(prev => [...prev, e.target.value])
            //...prev: mevcut array'in tüm elemanlarını al 
            //Kategoriyi listeye ekliyoruz
        }
    }

    const toggleCity = (e) => {
        if(selectedCities.includes(e.target.value)){
            setSelectedCities(prev => prev.filter(item => item !== e.target.value))
        }
        else{
            setSelectedCities(prev => [...prev, e.target.value])
        }
    }

    const toggleDistrict = (e) => {
        if(selectedDistricts.includes(e.target.value)){
            setSelectedDistricts(prev => prev.filter(item => item !== e.target.value))
        }
        else{
            setSelectedDistricts(prev => [...prev, e.target.value])
        }
    }

    const applyFilter = () => {
        let shopsCopy = [...shops];
        //[...shops]: spread operator ile orijinal array'i değiştirmeden kopyala
        
        if(category.length > 0){
            shopsCopy = shopsCopy.filter(shop => category.includes(shop.category));
             // - shop => category.includes(shop.category): 
        //   Mağazanın kategorisi seçili kategoriler içinde var mı?
        }
        
        if(selectedDistricts.length > 0){
            shopsCopy = shopsCopy.filter(shop => selectedDistricts.includes(shop.location));
        }
        else if(selectedCities.length > 0){
             //  Eğer ilçe seçilmemiş ama şehir seçilmişse
             // - else if: ilçe ve şehir aynı anda filtre uygulanmaz
            shopsCopy = shopsCopy.filter(shop => {
                const shopCity = shop.location.split('/')[1];
                  //  Mağazanın location'undan şehir ismini çıkar
                  // - shop.location: 'Pendik/İstanbul' formatında
                return selectedCities.includes(shopCity);
            });
        }
        
        setFilteredShops(shopsCopy);
        //Filtrelenmiş mağazaları state'e kaydet
    }

// Şehir seçildiğinde ilçeleri getir 
useEffect(() => {
    // Seçili şehir yoksa ilçe listesini temizle
    if (selectedCities.length === 0) {
        setDistricts([]);
        return;
    }

    // İlçeleri getiren fonksiyon
    const getDistricts = async () => {
        try {
            // Boş ilçe listesi oluştur
            const districtList = [];
            
            // Seçilen her şehir için
            for (const cityName of selectedCities) {
                // API'den şehir bilgilerini al
                const response = await fetch(`https://turkiyeapi.dev/api/v1/provinces?name=${cityName}`);
                const result = await response.json();
                
                // Eğer şehir bulundu ve ilçeleri varsa
                if (result.data && result.data.length > 0) {
                    const cityData = result.data[0];
                     //  İlk şehir verisini al (API array döndürüyor)
                    
                    // Her ilçeyi listeye ekle
                    cityData.districts.forEach(ilce => {
                        districtList.push({
                            name: ilce.name, // İlçe adı: "Kadıköy"
                            fullPath: `${ilce.name}/${cityName}` // Tam yol: "Kadıköy/İstanbul"
                        });
                    });
                }
            }
            
            // İlçe listesini state'e kaydet
            setDistricts(districtList);
            
        } catch (error) {
            // Hata olursa konsola yaz
            console.log('İlçeler alınamadı', error);
            setDistricts([]);
        }
    };

    // Fonksiyonu çalıştır
    getDistricts();

}, [selectedCities]); // Seçili şehirler değişince çalış;

    // Şehirleri getir
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await fetch('https://turkiyeapi.dev/api/v1/provinces');
                const data = await response.json();
                setCities(data.data.map(city => city.name));
            } catch (error) {
                console.log('Şehirler yüklenemedi');
                setCities([]);
            }
        };
        fetchCities();
    }, []);

    useEffect(() => {
        //  Filtre değişince otomatik filtrele
        applyFilter();
    }, [category, selectedCities, selectedDistricts, shops])

    useEffect(() => {
        //  Mağaza listesi değişince filteredShops'u güncelle
        setFilteredShops(shops);
    }, [shops])

    return (
        <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
            <div className='min-w-60'>
                <p onClick={() => setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>
                    FILTERS
                </p>
                
                {/* Kategori Filtresi */}
                <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
                    <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
                    <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
                        {['Men', 'Women'].map(item => (
                            <label key={item} className='flex gap-2 cursor-pointer'>
                                <input 
                                    type="checkbox" 
                                    value={item} 
                                    onChange={toggleCategory}
                                    className='w-3'
                                />
                                {item}
                            </label>
                        ))}
                    </div>
                </div>
                
                {/* Şehir Filtresi */}
                <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>  
                    <p className='mb-3 text-sm font-medium'>CITIES</p>
                    <div className='max-h-60 overflow-y-auto flex flex-col gap-2 text-sm font-light text-gray-700'>
                        {cities.map(city => (
                            <label key={city} className='flex gap-2 cursor-pointer'>
                                <input 
                                    type="checkbox" 
                                    value={city} 
                                    onChange={toggleCity}
                                    checked={selectedCities.includes(city)}
                                    className='w-3'
                                />
                                {city}
                            </label>
                        ))}
                    </div>
                </div>

                {/* İlçe Filtresi */}
                {districts.length > 0 && (
                    <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>  
                        <p className='mb-3 text-sm font-medium'>DISTRICTS</p>
                        <div className='max-h-60 overflow-y-auto flex flex-col gap-2 text-sm font-light text-gray-700'>
                            {districts.map(district => (
                                <label key={district.fullPath} className='flex gap-2 cursor-pointer'>
                                    <input 
                                        type="checkbox" 
                                        value={district.fullPath} 
                                        onChange={toggleDistrict}
                                        checked={selectedDistricts.includes(district.fullPath)}
                                        className='w-3'
                                    />
                                    {district.name}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Mağaza Listesi */}
            <div className='flex-1'>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
                    {filteredShops.map((shop, index) => (
                        <ShopItem 
                            key={index} 
                            id={shop._id} 
                            name={shop.name} 
                            image={shop.image} 
                            descripiton={shop.descripiton} 
                            category={shop.category} 
                            location={shop.location} 
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Shops