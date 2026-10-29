
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';

export default function App() {
  const [pesquisa, setPesquisa] = useState('');

  const categorias = [
    { nome: 'Analgésicos', emoji: '💊' },
    { nome: 'Antialérgicos', emoji: '🌿' },
    { nome: 'Vitaminas', emoji: '🍊' },
    { nome: 'Antibióticos', emoji: '🧬' },
  ];

  const medicamentos = [
    {
      nome: 'Paracetamol',
      descricao: 'Analgésico e antitérmico',
      categoria: 'Analgésico',
      simbolo: '💊',
    },
    {
      nome: 'Loratadina',
      descricao: 'Antialérgico',
      categoria: 'Antialérgico',
      simbolo: '🌿',
    },
    {
      nome: 'Vitamina C',
      descricao: 'Suplemento vitamínico',
      categoria: 'Vitamina',
      simbolo: '🍊',
    },
  ];

  const medicamentosFiltrados = medicamentos.filter((medicamento) =>
    medicamento.nome.toLowerCase().includes(pesquisa.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8FC" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>✚</Text>
          </View>

          <View style={styles.logoTextoContainer}>
            <Text style={styles.logoTexto}>
              Pill<Text style={styles.logoDestaque}>Dex</Text>
            </Text>
            <Text style={styles.subtituloLogo}>
              UMA ENCICLOPÉDIA FARMACÊUTICA
            </Text>
          </View>

          <TouchableOpacity style={styles.perfilBotao}>
            <Text style={styles.perfilIcone}>♙</Text>
          </TouchableOpacity>
        </View>

        {/* APRESENTAÇÃO */}
        <View style={styles.apresentacao}>
          <Text style={styles.etiqueta}>SEU GUIA DE INFORMAÇÃO</Text>

          <Text style={styles.titulo}>
            Conhecimento que{'\n'}
            <Text style={styles.tituloDestaque}>cuida de você.</Text>
          </Text>

          <Text style={styles.descricao}>
            Encontre informações sobre medicamentos de forma simples,
            organizada e acessível.
          </Text>
        </View>

        {/* PESQUISA */}
        <View style={styles.pesquisaContainer}>
          <Text style={styles.pesquisaIcone}>⌕</Text>

          <TextInput
            style={styles.input}
            placeholder="Pesquisar medicamento..."
            placeholderTextColor="#8995A8"
            value={pesquisa}
            onChangeText={setPesquisa}
            returnKeyType="search"
            autoCapitalize="none"
          />

          {pesquisa.length > 0 && (
            <TouchableOpacity onPress={() => setPesquisa('')}>
              <Text style={styles.limparPesquisa}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* CATEGORIAS */}
        <View style={styles.secao}>
          <View style={styles.secaoCabecalho}>
            <Text style={styles.secaoTitulo}>Explore categorias</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriasLista}
          >
            {categorias.map((categoria, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoriaCard}
                onPress={() => setPesquisa(categoria.nome.slice(0, -1))}
              >
                <View style={styles.categoriaIcone}>
                  <Text style={styles.categoriaEmoji}>
                    {categoria.emoji}
                  </Text>
                </View>

                <Text style={styles.categoriaNome}>
                  {categoria.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* MEDICAMENTOS */}
        <View style={styles.secao}>
          <View style={styles.secaoCabecalho}>
            <Text style={styles.secaoTitulo}>
              {pesquisa ? 'Resultados da pesquisa' : 'Medicamentos em destaque'}
            </Text>
          </View>

          {medicamentosFiltrados.length > 0 ? (
            medicamentosFiltrados.map((medicamento, index) => (
              <TouchableOpacity
                key={index}
                style={styles.medicamentoCard}
                activeOpacity={0.8}
              >
                <View style={styles.medicamentoIcone}>
                  <Text style={styles.medicamentoEmoji}>
                    {medicamento.simbolo}
                  </Text>
                </View>

                <View style={styles.medicamentoInfo}>
                  <Text style={styles.medicamentoNome}>
                    {medicamento.nome}
                  </Text>

                  <Text style={styles.medicamentoDescricao}>
                    {medicamento.descricao}
                  </Text>

                  <Text style={styles.medicamentoCategoria}>
                    {medicamento.categoria}
                  </Text>
                </View>

                <Text style={styles.seta}>›</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.vazioCard}>
              <Text style={styles.vazioTitulo}>
                Nenhum medicamento encontrado
              </Text>
              <Text style={styles.vazioDescricao}>
                Tente pesquisar usando outro nome.
              </Text>
            </View>
          )}
        </View>

        {/* AVISO */}
        <View style={styles.aviso}>
          <Text style={styles.avisoIcone}>ⓘ</Text>

          <View style={styles.avisoTextoContainer}>
            <Text style={styles.avisoTitulo}>
              Informação responsável
            </Text>

            <Text style={styles.avisoDescricao}>
              Consulte a bula oficial e um profissional de saúde antes de
              tomar decisões sobre medicamentos.
            </Text>
          </View>
        </View>

        {/* RODAPÉ */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>
            Pill<Text style={styles.logoDestaque}>Dex</Text>
          </Text>
          <Text style={styles.footerTexto}>
            Informação acessível. Uso consciente.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 12,
  },

  logoContainer: {
    width: 43,
    height: 43,
    backgroundColor: '#176B55',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoIcon: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: 'bold',
  },

  logoTextoContainer: {
    marginLeft: 11,
    flex: 1,
  },

  logoTexto: {
    fontSize: 24,
    fontWeight: '800',
    color: '#172B3A',
    letterSpacing: -1,
  },

  logoDestaque: {
    color: '#16866A',
  },

  subtituloLogo: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#7B8997',
    marginTop: 1,
  },

  perfilBotao: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E8F0EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  perfilIcone: {
    fontSize: 25,
    color: '#176B55',
  },

  apresentacao: {
    paddingHorizontal: 24,
    paddingTop: 29,
    paddingBottom: 25,
  },

  etiqueta: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16866A',
    letterSpacing: 1.8,
    marginBottom: 12,
  },

  titulo: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '800',
    color: '#172B3A',
    letterSpacing: -1,
  },

  tituloDestaque: {
    color: '#16866A',
  },

  descricao: {
    fontSize: 14,
    lineHeight: 22,
    color: '#718093',
    marginTop: 13,
    maxWidth: 310,
  },

  pesquisaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 22,
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EBF2',
    elevation: 2,
    shadowColor: '#172B3A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  pesquisaIcone: {
    fontSize: 29,
    color: '#16866A',
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: '#172B3A',
    height: '100%',
  },

  limparPesquisa: {
    color: '#718093',
    fontSize: 17,
    paddingLeft: 8,
  },

  secao: {
    marginTop: 31,
  },

  secaoCabecalho: {
    paddingHorizontal: 23,
    marginBottom: 15,
  },

  secaoTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#172B3A',
    letterSpacing: -0.3,
  },

  categoriasLista: {
    paddingHorizontal: 22,
    paddingBottom: 3,
  },

  categoriaCard: {
    width: 115,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 13,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EAF0F5',
  },

  categoriaIcone: {
    width: 43,
    height: 43,
    backgroundColor: '#EAF6F1',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  categoriaEmoji: {
    fontSize: 22,
  },

  categoriaNome: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34495A',
  },

  medicamentoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 22,
    marginBottom: 11,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EAF0F5',
  },

  medicamentoIcone: {
    width: 53,
    height: 53,
    borderRadius: 16,
    backgroundColor: '#EAF6F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  medicamentoEmoji: {
    fontSize: 25,
  },

  medicamentoInfo: {
    flex: 1,
    marginLeft: 13,
  },

  medicamentoNome: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172B3A',
  },

  medicamentoDescricao: {
    fontSize: 12,
    color: '#718093',
    marginTop: 4,
  },

  medicamentoCategoria: {
    alignSelf: 'flex-start',
    fontSize: 10,
    color: '#16866A',
    fontWeight: '700',
    backgroundColor: '#EAF6F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 7,
  },

  seta: {
    fontSize: 28,
    color: '#9AA8B6',
    marginLeft: 8,
  },

  vazioCard: {
    marginHorizontal: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
  },

  vazioTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172B3A',
    textAlign: 'center',
  },

  vazioDescricao: {
    fontSize: 12,
    color: '#718093',
    marginTop: 7,
    textAlign: 'center',
  },

  aviso: {
    flexDirection: 'row',
    marginHorizontal: 22,
    marginTop: 28,
    padding: 16,
    backgroundColor: '#EAF3F8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCEAF2',
  },

  avisoIcone: {
    fontSize: 23,
    color: '#397B9B',
    marginRight: 11,
  },

  avisoTextoContainer: {
    flex: 1,
  },

  avisoTitulo: {
    fontSize: 13,
    fontWeight: '800',
    color: '#28556D',
    marginBottom: 5,
  },

  avisoDescricao: {
    fontSize: 12,
    lineHeight: 19,
    color: '#527185',
  },

  footer: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 25,
  },

  footerLogo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#172B3A',
  },

  footerTexto: {
    fontSize: 11,
    color: '#8995A8',
    marginTop: 5,
  },
});