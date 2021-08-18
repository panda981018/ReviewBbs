package com.example.springsecuritytest.domain.repository;

import com.example.springsecuritytest.domain.entity.MemberEntity;
import com.querydsl.core.QueryResults;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.util.List;

import static com.example.springsecuritytest.domain.entity.QMemberEntity.memberEntity;

@RequiredArgsConstructor
@Repository
public class MemberQueryRepository { // CRUD

    private final JPAQueryFactory jpaQueryFactory;

    public QueryResults<String> findByNickname(Long id) throws SQLException {

        QueryResults<String> rtResult = jpaQueryFactory.select(memberEntity.nickname)
                .from(memberEntity)
                .where(memberEntity.id.ne(id))
                .fetchResults();

        return rtResult;
    }

    public List<String> findPasswordByUsername(String username) {

        return jpaQueryFactory.select(memberEntity.password)
                .from(memberEntity)
                .where(memberEntity.username.eq(username))
                .fetch();
    }

    public Page<MemberEntity> findAllExceptAdmin(String admin, Pageable pageable) {
        QueryResults<MemberEntity> rt = jpaQueryFactory.selectFrom(memberEntity)
                .where(memberEntity.username.ne(admin))
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetchResults();

        return new PageImpl<>(rt.getResults(), pageable, rt.getTotal());
    }

    // delete
    @Transactional
    public void deleteUser(String username) throws SQLException {

    }

}
