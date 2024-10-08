import { SafeAreaView, StyleSheet, Text, View, Alert, Pressable, Image, TextInput, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import Services from '../components/Services'; // Adjust the path according to your project structure
import DressItem from '../components/DressItem';
import Carousel from '../components/Carousel';
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../ProductReducer";
import { useNavigation } from "@react-navigation/native";
import { collection, getDoc, getDocs } from "firebase/firestore";

import { db } from "../firebase";

const HomeScreen = () => {
  const cart = useSelector((state) => state.cart.cart);
  const total = cart.reduce((curr, item) => curr + item.quantity * item.price, 0);
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  console.log(cart);

  const [displayCurrentAddress, setDisplayCurrentAddress] = useState('We are loading your location');
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(false);

  const dispatch = useDispatch();
  const product = useSelector((state) => state.product.product);

  useEffect(() => {
    checkIfLocationEnabled();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (product.length > 0) return;

    const fetchProducts = async () => {
      const colRef = collection(db, "types");
      const docsSnap = await getDocs(colRef);
      const fetchedItems = [];
      docsSnap.forEach((doc) => {
        fetchedItems.push(doc.data());
      });
      setItems(fetchedItems);
    };

    fetchProducts();
  }, [product.length]);

  useEffect(() => {
    if (items.length > 0) {
      items.forEach((service) => dispatch(getProducts(service)));
    }
  }, [items, dispatch]);

  const checkIfLocationEnabled = async () => {
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      Alert.alert(
        'Location services not enabled',
        'Please enable the location services',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ],
        { cancelable: false }
      );
    } else {
      setLocationServicesEnabled(enabled);
    }
  };

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission denied',
        'Allow the app to use the location services',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ],
        { cancelable: false }
      );
      return;
    }

    const { coords } = await Location.getCurrentPositionAsync();
    if (coords) {
      const { latitude, longitude } = coords;
      const response = await Location.reverseGeocodeAsync({ latitude, longitude });

      for (const item of response) {
        const address = `${item.name}, ${item.city}, ${item.postalCode}`;
        setDisplayCurrentAddress(address);
      }
    }
  };

  const services = [
    {
      id: "0",
      image: "https://cdn-icons-png.flaticon.com/128/4643/4643574.png",
      name: "shirt",
      quantity: 0,
      price: 10,
    },
    {
      id: "11",
      image: "https://cdn-icons-png.flaticon.com/128/892/892458.png",
      name: "T-shirt",
      quantity: 0,
      price: 10,
    },
    {
      id: "12",
      image: "https://cdn-icons-png.flaticon.com/128/9609/9609161.png",
      name: "dresses",
      quantity: 0,
      price: 10,
    },
    {
      id: "13",
      image: "https://cdn-icons-png.flaticon.com/128/599/599388.png",
      name: "jeans",
      quantity: 0,
      price: 10,
    },
    {
      id: "14",
      image: "https://cdn-icons-png.flaticon.com/128/9431/9431166.png",
      name: "Sweater",
      quantity: 0,
      price: 10,
    },
    {
      id: "15",
      image: "https://cdn-icons-png.flaticon.com/128/3345/3345397.png",
      name: "shorts",
      quantity: 0,
      price: 10,
    },
    {
      id: "16",
      image: "https://cdn-icons-png.flaticon.com/128/293/293241.png",
      name: "Sleeveless",
      quantity: 0,
      price: 10,
    },
  ];
  return (
    <>
      <ScrollView style={{ backgroundColor: "#F0F0F0", flex: 1, marginTop: 50 }}>
        <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
          <MaterialIcons name="location-on" size={30} color="#03AED2" />
          <View>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>Home</Text>
            <Text>{displayCurrentAddress}</Text>
          </View>
          <Pressable onPress={() => navigation.navigate("Profile")}  style={{ marginLeft: "auto", marginRight: 7 }}>
            <Image
              style={{ width: 40, height: 40, borderRadius: 20 }}
              source={{
                uri: "https://lh3.googleusercontent.com/ogw/AF2bZyiUFXmTM1SJ8eyju9ysak-8nDKAXbuokwy8CWA5X9A_RF8=s32-c-mo",
              }}
            />
          </Pressable>
        </View>

        <View
          style={{
            padding: 10,
            margin: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderWidth: 0.8,
            borderColor: "#C0C0C0",
            borderRadius: 7,
          }}
        >
          <TextInput placeholder="Search for items or More" />
          <Feather name="search" size={24} color="black" />
        </View>

        <Carousel />

        <Services />

        {product.map((item) => (
          <DressItem item={item} key={item.id} />
        ))}
      </ScrollView>

      {total > 0 && (
        <Pressable
          style={{
            backgroundColor: "#088F8F",
            padding: 10,
            marginBottom: 40,
            margin: 15,
            borderRadius: 7,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text style={{ fontSize: 17, fontWeight: "600", color: "white" }}>
              {cart.length} items | $ {total}
            </Text>
            <Text style={{ fontSize: 15, fontWeight: "400", color: "white", marginVertical: 6 }}>
              extra charges might apply
            </Text>
          </View>

          <Pressable onPress={() => navigation.navigate("PickUp")}>
            <Text style={{ fontSize: 17, fontWeight: "600", color: "white" }}>Proceed to pickup</Text>
            
          </Pressable>
        </Pressable>
      )}
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
