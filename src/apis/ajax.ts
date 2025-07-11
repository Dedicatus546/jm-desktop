import { format, getDate, parse } from "date-fns";

import http from "./http";
import { trpcClient } from "./ipc";

type RespWrapper<T> = {
  code: number;
  data: T;
  errorMsg?: string;
};

export const getSettingApi = () => {
  return http.Get<
    RespWrapper<{
      logoPath: string;
      webHost: string;
      imgHost: string;
      baseUrl: string;
      cnBaseUrl: string;
      version: string;
      storeLink: {
        google: string;
        web: string;
      };
      shuntList: Array<{
        title: string;
        key: number;
      }>;
    }>,
    RespWrapper<{
      logo_path: string;
      main_web_host: string;
      img_host: string;
      base_url: string;
      is_cn: number;
      cn_base_url: string;
      version: string;
      test_version: string;
      store_link: string;
      ios_version: string;
      ios_test_version: string;
      ios_store_link: string;
      ad_cache_version: number;
      bundle_url: string;
      is_hot_update: string;
      api_banner_path: string;
      version_info: string;
      app_shunts: Array<{
        title: string;
        key: number;
      }>;
      download_url: string;
      app_landing_page: string;
      float_ad: boolean;
      newYearEvent: boolean;
      foolsDayEvent: boolean;
    }>
  >("setting", {
    transform(res) {
      return {
        code: res.code,
        data: {
          logoPath: res.data.logo_path,
          webHost: "http://" + res.data.main_web_host,
          imgHost: res.data.img_host,
          baseUrl: res.data.base_url,
          cnBaseUrl: res.data.cn_base_url,
          version: res.data.version,
          storeLink: {
            google: res.data.store_link,
            web: res.data.ios_store_link,
          },
          shuntList: res.data.app_shunts,
        },
      };
    },
  });
};

export const loginApi = (query: { username: string; password: string }) => {
  const formData = new FormData();
  formData.append("username", query.username);
  formData.append("password", query.password);
  return http.Post<
    RespWrapper<{
      uid: number;
      username: string;
      email: string;
      avatar: string;
      jCoin: number;
      level: [number, string];
      currentExp: number;
      nextLevelExp: number;
      collectCount: number;
      maxCollectCount: number;
    }>,
    RespWrapper<{
      uid: string;
      username: string;
      email: string;
      emailverified: string;
      photo: string;
      fname: string;
      gender: string;
      message: string;
      coin: number;
      album_favorites: number;
      s: string;
      level_name: string;
      level: number;
      nextLevelExp: number;
      exp: string;
      expPercent: number;
      badges: unknown[];
      album_favorites_max: number;
      ad_free: boolean;
      ad_free_before: unknown;
      charge: string;
      jar: string;
    }>
  >("login", formData, {
    transform(res) {
      return {
        code: res.code,
        data: {
          uid: Number.parseInt(res.data.uid),
          username: res.data.username,
          email: res.data.email,
          avatar: res.data.photo,
          jCoin: res.data.coin,
          level: [res.data.level, res.data.level_name],
          currentExp: Number.parseInt(res.data.exp),
          nextLevelExp: res.data.nextLevelExp,
          collectCount: res.data.album_favorites,
          maxCollectCount: res.data.album_favorites_max,
        },
      };
    },
  });
};

export const getComicListApi = (query: {
  page: number;
  order: string;
  content: string;
}) => {
  return http.Get<
    RespWrapper<{
      total: number;
      redirect_aid: number | null;
      content: Array<{
        id: number;
        author: string;
        name: string;
        liked: boolean;
        isCollect: boolean;
        updateAt: number;
      }>;
    }>,
    RespWrapper<
      | {
          search_query: string;
          total: string;
          redirect_aid: string;
          content: [];
        }
      | {
          search_query: string;
          total: string;
          content: Array<{
            id: string;
            author: string;
            description: string | null;
            name: string;
            image: string;
            category: {
              id: string;
              title: string;
            };
            category_sub: {
              id: string;
              title: string;
            };
            liked: boolean;
            is_favorite: boolean;
            update_at: number;
          }>;
        }
    >
  >("search", {
    params: {
      search_query: query.content,
      page: query.page,
      o: query.order,
    },
    transform(res) {
      return {
        code: res.code,
        data: {
          total: Number.parseInt(res.data.total),
          redirect_aid:
            "redirect_aid" in res.data
              ? Number.parseInt(res.data.redirect_aid)
              : null,
          content: res.data.content.map((item) => {
            return {
              id: Number.parseInt(item.id),
              author: item.author,
              name: item.name,
              liked: item.liked,
              isCollect: item.is_favorite,
              updateAt: item.update_at,
            };
          }),
        },
      };
    },
  });
};

export const getCollectComicListApi = (query: {
  page: number;
  order: string;
  // folder_id: number;
}) => {
  return http.Get<
    RespWrapper<{
      list: Array<{
        id: number;
        author: string;
        name: string;
      }>;
      total: number;
    }>,
    RespWrapper<{
      count: number;
      folder_list: [];
      list: Array<{
        id: string;
        author: string;
        description: string | null;
        name: string;
        image: string;
        category: {
          id: string;
          title: string;
        };
        category_sub: {
          id: string;
          title: string;
        };
        latest_ep: unknown;
        latest_ep_aid: unknown;
      }>;
      total: string;
    }>
  >("favorite", {
    params: {
      page: query.page,
      size: 8,
      folder_id: 0,
      o: query.order,
    },
    transform(res) {
      return {
        code: res.code,
        data: {
          list: res.data.list.map((item) => {
            return {
              id: Number.parseInt(item.id),
              author: item.author,
              name: item.name,
              // liked: item.liked,
              // isCollect: item.is_favorite,
              // updateAt: item.update_at,
            };
          }),
          total: Number.parseInt(res.data.total),
        },
      };
    },
  });
};

export const getHistoryComicListApi = (query: { page: number }) => {
  return http.Get<
    RespWrapper<{
      list: Array<{
        id: number;
        author: string;
        name: string;
      }>;
      total: number;
    }>,
    RespWrapper<{
      count: number;
      folder_list: [];
      list: Array<{
        id: string;
        author: string;
        description: string | null;
        name: string;
        image: string;
        category: {
          id: string;
          title: string;
        };
        category_sub: {
          id: string;
          title: string;
        };
        latest_ep: unknown;
        latest_ep_aid: unknown;
      }>;
      total: number;
    }>
  >("watch_list", {
    params: {
      page: query.page,
    },
    transform(res) {
      return {
        code: res.code,
        data: {
          list: res.data.list.map((item) => {
            return {
              id: Number.parseInt(item.id),
              author: item.author,
              name: item.name,
              // liked: item.liked,
              // isCollect: item.is_favorite,
              // updateAt: item.update_at,
            };
          }),
          total: res.data.total,
        },
      };
    },
  });
};

export const getPromoteComicListApi = () => {
  return http.Get<
    RespWrapper<
      Array<{
        id: number;
        title: string;
        filterValue: string;
        list: Array<{
          id: number;
          author: string;
          name: string;
          liked: boolean;
          isCollect: boolean;
          updateAt: number;
        }>;
      }>
    >,
    RespWrapper<
      Array<{
        id: number | string;
        title: string;
        slug: string;
        type: string;
        filter_val: string;
        content: Array<{
          id: string;
          author: string;
          description: string | null;
          name: string;
          image: string;
          category: {
            id: string;
            title: string;
          };
          category_sub: {
            id: string;
            title: string;
          };
          liked: boolean;
          is_favorite: boolean;
          update_at: number;
        }>;
      }>
    >
  >("promote", {
    transform(res) {
      return {
        code: res.code,
        data: res.data.map((item) => {
          return {
            id: Number.parseInt(item.id + ""),
            title: item.title,
            filterValue: item.filter_val,
            list: item.content.map((item) => {
              return {
                id: Number.parseInt(item.id),
                author: item.author,
                name: item.name,
                liked: item.liked,
                isCollect: item.is_favorite,
                updateAt: item.update_at,
              };
            }),
          };
        }),
      };
    },
  });
};

// 最新漫画
// 该接口无返回total，无法做常规分页
export const getLatestComicListApi = (page: number) => {
  return http.Get<
    RespWrapper<
      Array<{
        id: number;
        author: string;
        name: string;
      }>
    >,
    RespWrapper<
      Array<{
        id: string;
        author: string;
        name: string;
      }>
    >
  >("latest", {
    params: {
      page,
    },
    transform(res) {
      return {
        code: res.code,
        data: res.data.map((item) => {
          return {
            id: Number.parseInt(item.id),
            author: item.author,
            name: item.name,
            // liked: item.liked,
            // isCollect: item.is_favorite,
            // updateAt: item.update_at,
          };
        }),
      };
    },
  });
};

export const getComicDetailApi = (id: number) => {
  return http.Get<
    RespWrapper<{
      id: number;
      authorList: string[];
      description: string;
      name: string;
      lookCount: number;
      likeCount: number;
      commentCount: number;
      tagList: string[];
      roleList: string[];
      workList: string[];
      isCollect: boolean;
      isLike: boolean;
      relateList: Array<{
        id: number;
        name: string;
        author: string;
      }>;
      seriesList: Array<{
        id: number;
        name: string;
      }>;
      currentSeriesId: number;
      price: number;
      isBuy: boolean;
    }>,
    RespWrapper<{
      id: number;
      name: string;
      images: unknown[];
      addtime: string;
      description: string;
      total_views: string;
      likes: string;
      series: Array<{
        id: string;
        name: string;
        sort: string;
      }>;
      series_id: string;
      comment_total: string; // 评论总数
      author: string[]; // 作者
      tags: string[]; // 标签
      works: string[]; // 作品
      actors: string[]; // 角色
      related_list: Array<{
        id: string;
        author: string;
        name: string;
        image: string;
      }>;
      liked: boolean;
      is_favorite: boolean;
      price: number | string;
      purchased: boolean;
      is_aids: unknown;
    }>
  >("album", {
    params: {
      id,
    },
    async transform(res) {
      res.data.series.sort((s1, s2) => +s1.sort - +s2.sort);
      return {
        code: res.code,
        data: {
          id: res.data.id,
          authorList: res.data.author,
          description: res.data.description,
          name: res.data.name,
          lookCount: Number.parseInt(res.data.total_views),
          likeCount: Number.parseInt(res.data.likes),
          commentCount: Number.parseInt(res.data.comment_total),
          tagList: res.data.tags,
          roleList: res.data.actors,
          workList: res.data.works,
          isCollect: res.data.is_favorite,
          isLike: res.data.liked,
          relateList: res.data.related_list.map((item) => {
            return {
              id: Number.parseInt(item.id),
              name: item.name,
              author: item.author,
            };
          }),
          seriesList: res.data.series.map((item, index) => {
            return {
              id: Number.parseInt(item.id),
              name: `第${index + 1}话${item.name ? "（" + item.name + "）" : ""}`,
            };
          }),
          currentSeriesId: Number.parseInt(res.data.series_id),
          price: Number.parseInt(res.data.price + ""),
          isBuy: !!res.data.purchased,
        },
      };
    },
  });
};

export const getCollectTagListApi = async () => {
  return http.Get<RespWrapper<string[]>>("tag_favorite");
};

export const getCategoryListApi = () => {
  return http.Get<
    RespWrapper<{
      categoryList: Array<{
        id: number;
        name: string;
        type: "slug" | "search";
        slug: string;
        subCategoryList: Array<{
          id: number;
          name: string;
          slug: string;
        }>;
      }>;
      tagTypeList: Array<{
        title: string;
        list: Array<string>;
      }>;
    }>,
    RespWrapper<{
      categories: Array<{
        id: string;
        name: string;
        slug: string;
        total_albums: string;
        type: "slug" | "search";
        sub_categories?: Array<{
          CID: string;
          name: string;
          slug: string;
        }>;
      }>;
      // 快速搜索
      blocks: Array<{
        title: string;
        content: Array<string>;
      }>;
    }>
  >("categories", {
    transform(res) {
      return {
        code: res.code,
        errorMsg: res.errorMsg,
        data: {
          categoryList: res.data.categories.map((item) => {
            return {
              id: Number.parseInt(item.id),
              name: item.name,
              type: item.type,
              slug: item.slug,
              subCategoryList: (item.sub_categories ?? []).map((item) => {
                return {
                  id: Number.parseInt(item.CID),
                  name: item.name,
                  slug: item.slug,
                };
              }),
            };
          }),
          tagTypeList: res.data.blocks.map((item) => {
            return {
              title: item.title,
              list: item.content,
            };
          }),
        },
      };
    },
  });
};

export const getCategoryFilterListApi = (query: {
  page: number;
  category: string;
  order: string;
}) => {
  return http.Get<
    RespWrapper<{
      total: number;
      list: Array<{
        id: number;
        author: string;
        name: string;
        liked: boolean;
        isCollect: boolean;
        updateAt: number;
      }>;
    }>,
    RespWrapper<{
      total: string;
      content: Array<{
        id: string;
        author: string;
        description: string | null;
        name: string;
        image: string;
        category: {
          id: string;
          title: string;
        };
        category_sub: {
          id: string;
          title: string;
        };
        liked: boolean;
        is_favorite: boolean;
        update_at: number;
      }>;
    }>
  >("categories/filter", {
    params: {
      page: query.page,
      // TODO 未知参数名
      // order: undefined,
      c: query.category,
      o: query.order,
    },
    transform(res) {
      return {
        code: res.code,
        data: {
          total: Number.parseInt(res.data.total),
          list: res.data.content.map((item) => {
            return {
              id: Number.parseInt(item.id),
              author: item.author,
              name: item.name,
              liked: item.liked,
              isCollect: item.is_favorite,
              updateAt: item.update_at,
            };
          }),
        },
      };
    },
  });
};

export const getHotTagListApi = () => {
  return http.Get<RespWrapper<Array<string>>>("hot_tags").then();
};

// 等级相关
export const getForumApi = async () => {
  return http.Get("forum", {
    params: {
      page: 1,
      // mode: "all",
      // mode: "manhua",
      aid: 416130,
    },
  });
};

// getForumApi();

type Comment = {
  AID: string;
  BID: unknown;
  CID: string;
  UID: string;
  username: string;
  nickname: string;
  likes: string;
  gender: string;
  update_at: string;
  addtime: string;
  parent_CID: string;
  expinfo: {
    level_name: string;
    level: number;
    nextLevelExp: number;
    exp: string;
    expPercent: number; // 100
    uid: string;
    badges: Array<{
      content: string;
      name: string;
      id: string;
    }>;
  };
  name: string;
  content: string;
  photo: string;
  spoiler: unknown; // 是否剧透
  replys?: Array<Comment>;
};

const avatarColorCache = new Map<string, string>();
const getAvatar = (str: string) => {
  if (["nopic-Male.gif", "nopic-Female.gif"].includes(str)) {
    return null;
  }
  return str;
};
const getAvatarColor = async (nickname: string) => {
  let color: string | undefined = undefined;
  if ((color = avatarColorCache.get(nickname))) {
    return color;
  }
  const hash = (await trpcClient.md5.query(nickname)).substring(0, 6);
  color = `#${hash}`;
  avatarColorCache.set(nickname, color);
  return color;
};
export const getComicCommentListApi = (query: {
  page: number;
  comicId: number;
}) => {
  return http.Get<
    RespWrapper<{
      list: Array<{
        id: number;
        parentId: number;
        nickname: string;
        likeCount: number;
        content: string;
        avatar: string | null;
        avatarColor: string;
        createTime: string;
        replyList: Array<{
          id: number;
          parentId: number;
          nickname: string;
          likeCount: number;
          createTime: string;
          content: string;
          avatar: string | null;
          avatarColor: string;
        }>;
      }>;
      total: number;
    }>,
    RespWrapper<{
      list: Array<Comment>;
      total: string;
    }>
  >("forum", {
    params: {
      page: query.page,
      mode: "manhua",
      aid: query.comicId,
    },
    async transform(res) {
      return {
        code: res.code,
        data: {
          list: await Promise.all(
            res.data.list.map(async (item) => {
              const avatar = getAvatar(item.photo);
              const avatarColor =
                avatar === null ? await getAvatarColor(item.username) : "#eee";
              return {
                id: Number.parseInt(item.CID),
                parentId: Number.parseInt(item.parent_CID),
                nickname: item.username,
                likeCount: Number.parseInt(item.likes),
                content: item.content,
                avatar,
                avatarColor,
                createTime: format(
                  parse(item.addtime, "MMM d, yyyy", new Date()),
                  "yyyy-MM-dd",
                ),
                replyList: await Promise.all(
                  item.replys?.map(async (item) => {
                    const avatar = getAvatar(item.photo);
                    const avatarColor =
                      avatar === null
                        ? await getAvatarColor(item.username)
                        : "#eee";
                    return {
                      id: Number.parseInt(item.CID),
                      parentId: Number.parseInt(item.parent_CID),
                      nickname: item.username,
                      likeCount: Number.parseInt(item.likes),
                      createTime: format(
                        parse(item.addtime, "MMM d, yyyy", new Date()),
                        "yyyy-MM-dd",
                      ),
                      content: item.content,
                      avatar,
                      avatarColor,
                    };
                  }) ?? [],
                ),
              };
            }),
          ),
          total: Number.parseInt(res.data.total),
        },
      };
    },
    cacheFor: null,
  });
};

export const getUserCommentListApi = (page: number, userId: number) => {
  return http.Get<
    RespWrapper<{
      list: Array<{
        id: number;
        parentId: number;
        nickname: string;
        likeCount: number;
        content: string;
        avatar: string | null;
        avatarColor: string;
        createTime: string;
        replyList: Array<{
          id: number;
          parentId: number;
          nickname: string;
          likeCount: number;
          createTime: string;
          content: string;
          avatar: string | null;
          avatarColor: string;
        }>;
      }>;
      total: number;
    }>,
    RespWrapper<{
      list: Array<Comment>;
      total: string;
    }>
  >("forum", {
    params: {
      page: page,
      mode: undefined,
      uid: userId,
    },
    async transform(res) {
      return {
        code: res.code,
        data: {
          list: await Promise.all(
            res.data.list.map(async (item) => {
              const avatar = getAvatar(item.photo);
              const avatarColor =
                avatar === null ? await getAvatarColor(item.username) : "#eee";
              return {
                id: Number.parseInt(item.CID),
                parentId: Number.parseInt(item.parent_CID),
                nickname: item.username,
                likeCount: Number.parseInt(item.likes),
                content: item.content,
                avatar,
                avatarColor,
                createTime: format(
                  parse(item.addtime, "MMM d, yyyy", new Date()),
                  "yyyy-MM-dd",
                ),
                replyList: await Promise.all(
                  item.replys?.map(async (item) => {
                    const avatar = getAvatar(item.photo);
                    const avatarColor =
                      avatar === null
                        ? await getAvatarColor(item.username)
                        : "#eee";
                    return {
                      id: Number.parseInt(item.CID),
                      parentId: Number.parseInt(item.parent_CID),
                      nickname: item.username,
                      likeCount: Number.parseInt(item.likes),
                      createTime: format(
                        parse(item.addtime, "MMM d, yyyy", new Date()),
                        "yyyy-MM-dd",
                      ),
                      content: item.content,
                      avatar,
                      avatarColor,
                    };
                  }) ?? [],
                ),
              };
            }),
          ),
          total: Number.parseInt(res.data.total),
        },
      };
    },
  });
};

export const commentComicApi = (content: string, comicId: number) => {
  const formData = new FormData();
  formData.append("comment", content);
  // TODO 剧透功能
  formData.append("status", "1"); // 1 无剧透 2 有剧透
  formData.append("aid", comicId + "");
  return http.Post<
    RespWrapper<{
      msg: string;
      status: string;
      aid: number;
      cid: number;
      spoiler: string;
    }>
  >("comment", formData);
};

// 签到情况
export const getSignInDataApi = (userId: number) => {
  return http.Get<
    RespWrapper<{
      id: number;
      name: string;
      threeDaysCoinCount: number;
      threeDaysExpCount: number;
      sevenDaysCoinCount: number;
      sevenDaysExpCount: number;
      pcBackground: string;
      mobileBackground: string;
      currentProgress: number;
      dateMap: Record<
        string,
        {
          isNextDaySign: boolean;
          isLastDaySign: boolean;
          isSign: boolean;
          isLast: boolean;
          hasExtraBonus: boolean;
        }
      >;
    }>,
    RespWrapper<{
      daily_id: number;
      three_days_coin: string;
      three_days_exp: string;
      seven_days_coin: string;
      seven_days_exp: string;
      event_name: string;
      background_pc: string;
      background_phone: string;
      currentProgress: string;
      record: Array<
        Array<{
          date: string;
          signed: boolean;
          bonus: boolean;
        }>
      >;
    }>
  >("daily", {
    params: {
      user_id: userId,
    },
    transform(res) {
      const map: Record<
        string,
        {
          isNextDaySign: boolean;
          isLastDaySign: boolean;
          isSign: boolean;
          isLast: boolean;
          hasExtraBonus: boolean;
        }
      > = {};
      const currentDate = getDate(new Date(), {}).toString().padStart(2, "0");
      return {
        code: res.code,
        data: {
          id: res.data.daily_id,
          name: res.data.event_name,
          threeDaysCoinCount: Number.parseInt(res.data.three_days_coin),
          threeDaysExpCount: Number.parseInt(res.data.three_days_exp),
          sevenDaysCoinCount: Number.parseInt(res.data.seven_days_coin),
          sevenDaysExpCount: Number.parseInt(res.data.seven_days_exp),
          pcBackground: res.data.background_pc,
          mobileBackground: res.data.background_phone,
          currentProgress:
            Number.parseFloat(
              res.data.currentProgress.substring(
                0,
                res.data.currentProgress.length - 1,
              ),
            ) / 100,
          dateMap: res.data.record
            .flat()
            .map((item) => {
              // test
              // const isSign = Math.random() < 0.5;
              return {
                date: item.date,
                isSign: !!item.signed,
                isLast: currentDate >= item.date,
                // isSign,
                hasExtraBonus: item.bonus,
              };
            })
            .map((item, index, array) => {
              return {
                ...item,
                isNextDaySign:
                  index < array.length - 1 && array[index + 1].isSign,
                isLastDaySign: index > 0 && array[index - 1].isSign,
              };
            })
            .reduce((map, item) => {
              map[item.date] = {
                isNextDaySign: item.isNextDaySign,
                isLastDaySign: item.isLastDaySign,
                isSign: item.isSign,
                isLast: item.isLast,
                hasExtraBonus: item.hasExtraBonus,
              };
              return map;
            }, map),
        },
      };
    },
    cacheFor: null,
  });
};

// 收藏和取消收藏
export const collectComicApi = (comicId: number) => {
  const formData = new FormData();
  formData.set("aid", comicId + "");
  return http.Post<
    RespWrapper<{
      msg: string;
      status: "ok" | string;
      type: "remove" | "add";
    }>
  >("favorite", formData);
};

// 喜欢，一次性操作
export const likeComicApi = (comicId: number) => {
  const formData = new FormData();
  formData.set("id", comicId + "");
  return http.Post<
    RespWrapper<{
      code: number;
      msg: string;
      status: string;
    }>
  >("like", formData);
};

// 2024.09.28
// 该接口目前为停用状态
export const likeCommentApi = async (commentId: number) => {
  const formData = new FormData();
  formData.set("c_id", commentId + "");
  return http.Post<void, RespWrapper<unknown>>("comment_vote", formData);
};

// 签到 TODO 未签的数据结构未知
// 已签 data: {msg: string} data.msg: 你今天已经签过了
export const signInApi = (userId: number, dayId: number) => {
  const formData = new FormData();
  formData.set("user_id", userId + "");
  formData.set("daily_id", dayId + "");
  return http.Post<RespWrapper<{ msg: string }>>("daily_chk", formData);
};

// 获取图片列表，需要通过正则来解析 html 文件内容
export const getComicPicListApi = (
  comicId: number,
  shuntKey: number | undefined,
) => {
  return http.Get<{ list: string[] }, string>("chapter_view_template", {
    params: {
      id: comicId,
      mode: "vertical",
      page: 0,
      app_img_shunt: shuntKey,
      express: "off",
      v: Math.floor(Date.now() / 1000),
      // id=416130&mode=vertical&page=0&app_img_shunt=1&express=off&v=1727492089
    },
    async transform(htmlStr) {
      // 2025.06.15 新版匹配方式
      // 正则表达式匹配 result 对象
      const resultRegex = /const result\s*=\s*({[\s\S]*?});/;
      const resultMatch = htmlStr.match(resultRegex);
      let result: { images: Array<string> } | null = null;
      if (resultMatch) {
        try {
          result = eval(`(${resultMatch[1]})`);
        } catch (e) {
          console.error("Error parsing result object:", e);
        }
      }

      // 正则表达式匹配 config 对象
      const configRegex = /const config\s*=\s*({[\s\S]*?});/;
      const configMatch = htmlStr.match(configRegex);
      let config: {
        cache: string;
        imghost: string;
        jmid: string;
      } | null = null;
      if (configMatch) {
        try {
          config = eval(`(${configMatch[1]})`);
        } catch (e) {
          console.error("Error parsing config object:", e);
        }
      }
      if (!result || !config) {
        return {
          list: [],
        };
      }
      return {
        list: result.images.map(
          (item) =>
            `${config.imghost}/media/photos/${config.jmid}/${item}${config.cache}`,
        ),
      };
    },
  });
  // .then(() => {
  //   return [
  //     "https://cdn-msp.jmapiproxy3.cc/media/photos/113592/00001.webp",
  //     "https://cdn-msp.jmapiproxy3.cc/media/photos/113592/00002.webp",
  //     "https://cdn-msp.jmapiproxy3.cc/media/photos/113592/00003.webp",
  //     "https://cdn-msp.jmapiproxy3.cc/media/photos/113592/00004.webp",
  //     "https://cdn-msp.jmapiproxy3.cc/media/photos/113592/00005.webp",
  //   ];
  // });
};

// getComicPicList(416130);

export const getComicDownloadInfoApi = (comicId: number) => {
  return http.Get<
    RespWrapper<{
      fileSize: number;
      downloadUrl: string;
      md5: string;
      expires: number;
    }>,
    RespWrapper<{
      title: string;
      fileSize: string;
      download_url: string;
      img_url: string;
    }>
  >(`album_download_2/${comicId}`, {
    transform(res) {
      const url = new URL(res.data.download_url);
      return {
        code: res.code,
        data: {
          fileSize: Number.parseFloat(res.data.fileSize) * 1024 * 1024,
          downloadUrl: res.data.download_url,
          md5: url.searchParams.get("md5")!,
          expires: Number.parseInt(url.searchParams.get("expires")!),
        },
      };
    },
  });
};

// export const downloadComicApi = async (
//   comicId: number,
//   onDownloadProgress: (args: { loaded: number; total: number }) => void,
// ) => {
//   return http
//     .Get<
//       RespWrapper<{
//         title: string;
//         fileSize: string;
//         download_url: string;
//         img_url: string;
//       }>
//     >(`album_download_2/${comicId}`)
//     .then(async (res) => {
//       const { download_url, title, fileSize } = res.data;
//       const total = Number.parseFloat(fileSize) * 1024 * 1024;
//       const url = new URL(download_url);
//       const path = url.pathname + url.search;
//       return http
//         .Get<Blob>(path, {
//           responseType: "blob",
//           // onDownloadProgress(progressEvent) {
//           //   // 这里由于没有 total 需要手动计算
//           //   onDownloadProgress({
//           //     loaded:
//           //       progressEvent.loaded > total ? total : progressEvent.loaded,
//           //     total,
//           //   });
//           // },
//         })
//         .then((blob) => {
//           const file = new File([blob], `[JM${comicId}] ${title}.zip`, {
//             type: "application/zip",
//           });
//           console.log("download file", file);
//           return file;
//         });
//     });
// };

// {
//   "title": "[空气系☆汉化] (C101) [じぇのばけーき (たかやKi)] 黒猫はお年顷 (ブルーアーカイブ)",
//   "fileSize": "9.3 MB",
//   "download_url": "https://www.jmeadpoolcdn.life/dl_comic_zip?md5=AWe3g3s7th1PWCb50WM5Vg&expires=1727973733&aid=416130",
//   "img_url": "https://cdn-msp2.jmapiproxy2.cc/media/albums/416130.jpg?v=1674551902"
// }

// downloadComicApi(416130);

export const downloadComicApi = (query: {
  md5: string;
  expires: number;
  comicId: number;
  fileName: string;
}) => {
  return http.Get<File, Blob>("dl_comic_zip", {
    responseType: "blob",
    params: {
      md5: query.md5,
      expires: query.expires,
      aid: query.comicId,
    },
    transform(blob) {
      const file = new File([blob], query.fileName, {
        type: "application/zip",
      });
      return file;
    },
  });
};

export const getWeekListApi = () => {
  return http.Get<
    RespWrapper<{
      categoryList: Array<{
        id: number;
        name: string;
      }>;
      typeList: Array<{
        id: string;
        name: string;
      }>;
    }>,
    RespWrapper<{
      categories: Array<{
        id: string;
        time: string;
        title: string;
      }>;
      type: Array<{
        id: string;
        title: string;
      }>;
    }>
  >("week", {
    transform(res) {
      return {
        code: res.code,
        data: {
          categoryList: res.data.categories.map((item) => {
            return {
              id: Number.parseInt(item.id),
              name: item.time,
            };
          }),
          typeList: res.data.type.map((item) => {
            return {
              id: item.id,
              name: item.title,
            };
          }),
        },
      };
    },
  });
};

export const getWeekComicListApi = (query: {
  page: number;
  category: number;
  type: string;
}) => {
  return http.Get<
    RespWrapper<{
      total: number;
      list: Array<{
        id: number;
        author: string;
        name: string;
        liked: boolean;
        isCollect: boolean;
        updateAt: number;
      }>;
    }>,
    RespWrapper<{
      total: number;
      list: Array<{
        id: string;
        author: string;
        description: string;
        name: string;
        image: string;
        category: {
          id: string;
          title: string;
        };
        category_sub: {
          id: null;
          title: null;
        };
        liked: boolean;
        is_favorite: boolean;
        update_at: number;
      }>;
    }>
  >("week/filter", {
    params: {
      page: query.page,
      id: query.category,
      type: query.type,
    },
    transform(res) {
      return {
        code: res.code,
        data: {
          total: res.data.total,
          list: res.data.list.map((item) => {
            return {
              id: Number.parseInt(item.id),
              author: item.author,
              name: item.name,
              liked: item.liked,
              isCollect: item.is_favorite,
              updateAt: item.update_at,
            };
          }),
        },
      };
    },
  });
};

export const buyComicApi = (comicId: number) => {
  const formData = new FormData();
  formData.set("id", comicId + "");
  return http.Post<
    RespWrapper<{
      msg: string;
      status: "ok" | "error";
    }>
  >("coin_buy_comics", formData);
};
